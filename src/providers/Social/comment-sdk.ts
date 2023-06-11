import { CommentRepository, ReactionRepository } from '@amityco/ts-sdk';

export interface ICommentRes {
  data: Amity.Comment<any>[];
  onNextPage: () => any;
  unsubscribe: () => any;
  hasNextPage: boolean;
}

export async function addCommentReaction(
  commentId: string,
  reactionName: string
): Promise<boolean> {
  const reactionObject: Promise<boolean> = new Promise(
    async (resolve, reject) => {
      try {
        const isCommentReactionAdded = await ReactionRepository.addReaction(
          'comment',
          commentId,
          reactionName
        );
        resolve(isCommentReactionAdded);
      } catch (error) {
        reject(error);
      }
    }
  );
  return reactionObject;
}
export async function removeCommentReaction(
  commentId: string,
  reactionName: string
): Promise<boolean> {
  const reactionObject: Promise<boolean> = new Promise(
    async (resolve, reject) => {
      try {
        const isCommentReactionRemoved =
          await ReactionRepository.removeReaction(
            'comment',
            commentId,
            reactionName
          );
        resolve(isCommentReactionRemoved);
      } catch (error) {
        reject(error);
      }
    }
  );
  return reactionObject;
}
export async function createComment(
  text: string,
  postId: string
): Promise<Amity.Comment<any>> {
  const createCommentObject: Promise<Amity.Comment<any>> = new Promise(
    async (resolve, reject) => {
      try {
        const newComment = {
          data: {
            text: text,
          },
          referenceId: postId,
          referenceType: 'post' as Amity.CommentReferenceType,
        };

        const { data: comment } = await CommentRepository.createComment(
          newComment
        );
        console.log('comment: ', comment);
        resolve(comment);
      } catch (error) {
        reject(error);
      }
    }
  );
  return createCommentObject;
}

export async function getCommentsDataByIds(
  commentIds: string[]
): Promise<Amity.Comment<any>[]> {
  const commentObject: Promise<Amity.Comment<any>[]> = new Promise(
    async (resolve, reject) => {
      try {
        const { data } = await CommentRepository.getCommentByIds(commentIds);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    }
  );
  return commentObject;
}