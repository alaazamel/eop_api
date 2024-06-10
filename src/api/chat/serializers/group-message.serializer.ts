import { GroupMessage } from '../entities/group-message.entity';
import * as moment from 'moment';
import { DEFAULT_DB_DATETIME_FORMAT } from '../../../common/constants/constants';
import { FileUtilityService } from '../../../config/files/utility/file-utility.service';
import { SenderSerializer } from './sender.serializer';
import { ReactionSerializer } from './reaction.serializer';
import { UserRole } from '../../userRole/entities/user_role.entity';
import { UserBriefSerializer } from '../../user/serializers/user-brief.serializer';

export class GroupMessageSerializer {
  static serialize(
    fileUtilityService: FileUtilityService,
    data?: GroupMessage,
  ): any {
    if (!data) return null;

    // Calculate no. reactions & reacted users for each reaction_id
    const reactionsMetaData: any = {};

    for (const reaction of data.reactions) {
      const reactionId = reaction.reaction.id;
      const reactionData = reaction.reaction;
      const reactor = reaction.reactedBy;
      const parsedReactor = UserBriefSerializer.serialize(
        fileUtilityService,
        reactor,
      );

      const reactorData = {
        ...parsedReactor,
        is_organizer: reactor.userRole.id == +UserRole.EMPLOYEE,
        reaction_date: moment(reaction.createdAt).format(
          DEFAULT_DB_DATETIME_FORMAT,
        ),
      };

      if (!reactionsMetaData[reactionId]) {
        reactionsMetaData[reactionId] = {
          reaction: ReactionSerializer.serialize(
            fileUtilityService,
            reactionData,
          ),
          reacted_users: [],
          no_reactions: 0,
        };
      }

      reactionsMetaData[reactionId].reacted_users.push(reactorData);
      reactionsMetaData[reactionId].no_reactions += 1;
    }

    // Convert the dictionary to a list of objects
    const metaDataList = Object.values(reactionsMetaData);

    return {
      message_id: data.id,
      text: data.content,
      user: SenderSerializer.serialize(fileUtilityService, data.sender),
      timestamp: moment(data.createdAt).format(DEFAULT_DB_DATETIME_FORMAT),
      reactions_meta_data: metaDataList,
      // reactions: MessageReactionSerializer.serializeList(
      //   fileUtilityService,
      //   data.reactions,
      // ),
      replied_message: data.repliedMessage
        ? {
            message_id: data.repliedMessage.id,
            message_content: data.repliedMessage.content,
            sender_username: data.sender.username,
          }
        : null,
    };
  }

  static serializeList(
    fileUtilityService: FileUtilityService,
    data?: GroupMessage[],
  ) {
    if (!data) return [];
    return data.map((item) => this.serialize(fileUtilityService, item));
  }
}
