import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { closeIcon } from '../../svg/svg-xml-list';

import { styles } from './styles';

import { MessageRepository } from '@amityco/ts-sdk-react-native';

interface IModal {
  visible: boolean;
  onClose: () => void;
  onFinishEdit?: () => void;
  messageId: string;
  messageText: string;
}
const EditMessageModal = ({ visible, onClose, messageId, messageText, onFinishEdit }: IModal) => {

  const [inputMessage, setInputMessage] = useState(messageText);

  useEffect(() => {
    setInputMessage(messageText)
  }, [messageText])



  const updateMessage = async () => {
    const updatedMessage = {
      data: {
        text: inputMessage,
      },
    };

    const { data: message } = await MessageRepository.updateMessage(messageId, updatedMessage);
    if(message){
      onFinishEdit && onFinishEdit()
    }


  }


  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <SvgXml xml={closeIcon} width="17" height="17" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Edit Message</Text>
        </View>
        <TouchableOpacity onPress={updateMessage} style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Save</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <View style={styles.AllInputWrap}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.select({ ios: 100, android: 80 })}
            style={styles.AllInputWrap}
          >
            <ScrollView style={styles.container}>
              <TextInput
                multiline
                placeholder="What's going on..."
                style={styles.textInput}
                value={inputMessage}
                onChangeText={(text) => setInputMessage(text)}
              />
            </ScrollView>
          </KeyboardAvoidingView>


        </View>
      </View>
    </Modal>
  );
};

export default EditMessageModal;

