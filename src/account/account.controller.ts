import { Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AccountService } from './account.service';

@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post('/check-email')
  @ApiOperation({
    summary: '이메일 중복확인',
    description: '이메일중복확인api',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string', description: 'email' } },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid Request body' })
  @ApiConflictResponse({ description: 'Duplicated Email' })
  @ApiOkResponse()
  async checkEmailDulicate() {}
}
