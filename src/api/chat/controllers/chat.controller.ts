import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from '../../../auth/guards/access-token.guard';
import { AttendeeService } from '../../attendee/services/attendee.service';
import { ChatApiService } from '../services/chat-api.service';
import { ChatListItemSerializer } from '../serializers/chat-list-item.serializer';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRoleEnum } from '../../userRole/enums/user-role.enum';
import { RoleGuard } from '../../../common/guards/role/role.guard';
import { ChatGroupFilter } from '../dto/chat-group.filter';
import { GetChatGroupDto } from '../dto/get-chat-group.dto';
import { GroupDetailsSerializer } from '../serializers/group-details.serializer';
import { FileUtilityService } from '../../../config/files/utility/file-utility.service';
import { ChatService } from '../services/chat.service';
import { User } from '../../../common/decorators/user.decorator';
import { AuthUserType } from '../../../common/types/auth-user.type';
import { ChatGateway } from '../gateways/chat.gateway';

@Controller('chat')
export class ChatController {
  private readonly attendeeService: AttendeeService;
  private readonly chatApiService: ChatApiService;
  private readonly chatService: ChatService;
  private readonly fileUtilityService: FileUtilityService;
  private readonly chatGateway: ChatGateway;

  constructor(
    attendeeService: AttendeeService,
    chatApiService: ChatApiService,
    chatService: ChatService,
    chatGateway: ChatGateway,
    fileUtilityService: FileUtilityService,
  ) {
    this.fileUtilityService = fileUtilityService;
    this.attendeeService = attendeeService;
    this.chatApiService = chatApiService;
    this.chatService = chatService;
    this.chatGateway = chatGateway;
  }

  @Delete('delete-message/:id')
  @Roles(UserRoleEnum.EMPLOYEE)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async deleteMessage(@Param('id') id: number) {
    // delete the message
    const result = await this.chatApiService.deleteMessage(id);

    if (result.isDeleted) {
      // emit an event
      this.chatGateway.emitMessageDeletedEvent(result.groupId!, id);
    }
    return result.isDeleted;
  }

  @Get('attendee')
  @Roles(UserRoleEnum.ATTENDEE)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async getChattingList(@Req() req: any) {
    const user = req.user;
    const userId = user.sub;

    // get the attendee Id
    const attendee = await this.attendeeService.getAttendeeByUserId(userId);

    // return the list.
    const result = await this.chatApiService.getChattingList(attendee.id);
    return ChatListItemSerializer.serializeList(result);
  }

  @Get('joined-groups')
  @Roles(UserRoleEnum.ATTENDEE, UserRoleEnum.EMPLOYEE)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async getJoinedGroups(@User() user: AuthUserType) {
    return this.chatService.getListOfChannels(user);
  }

  @Post('group')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRoleEnum.ATTENDEE, UserRoleEnum.EMPLOYEE)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async getChatGroup(
    @Req() req: any,
    @Query() params: ChatGroupFilter,
    @Body() payload: GetChatGroupDto,
  ) {
    const user = req.user;
    const result = await this.chatApiService.getChatGroupById(
      params,
      user,
      payload,
    );
    return GroupDetailsSerializer.serialize(this.fileUtilityService, result);
  }
}
