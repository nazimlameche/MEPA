import { Controller, Get, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';

interface JwtRequest {
  user: { id: string; role: string };
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@Request() req: JwtRequest) {
    return this.usersService.getProfile(req.user.id);
  }

  /** CNIL: export de toutes les données personnelles (droit d'accès RGPD) */
  @Get('me/data')
  exportData(@Request() req: JwtRequest) {
    return this.usersService.exportUserData(req.user.id);
  }

  /** CNIL: suppression cascade (droit à l'effacement RGPD) */
  @Delete(':id')
  @Roles('admin')
  deleteUser(@Param('id') id: string, @Request() req: JwtRequest) {
    return this.usersService.deleteWithCascade(id, req.user.id);
  }
}
