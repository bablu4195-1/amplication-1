import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FindOneArgs } from 'src/dto';
import { Project, User } from 'src/models';
import { ProjectCreateArgs } from './dto/ProjectCreateArgs';
import { ProjectFindManyArgs } from './dto/ProjectFindManyArgs';
import { ProjectService } from './project.service';
import { InjectContextValue } from 'src/decorators/injectContextValue.decorator';
import { InjectableResourceParameter } from 'src/enums/InjectableResourceParameter';
import { Roles } from 'src/decorators/roles.decorator';
import { UseFilters, UseGuards } from '@nestjs/common';
import { GqlResolverExceptionsFilter } from 'src/filters/GqlResolverExceptions.filter';
import { GqlAuthGuard } from 'src/guards/gql-auth.guard';
import { UserEntity } from 'src/decorators/user.decorator';

@Resolver(() => Project)
@UseFilters(GqlResolverExceptionsFilter)
@UseGuards(GqlAuthGuard)
export class ProjectResolver {
  constructor(private projectService: ProjectService) {}

  @Query(() => [Project], { nullable: false })
  @Roles('ORGANIZATION_ADMIN')
  async projects(@Args() args: ProjectFindManyArgs): Promise<Project[]> {
    return this.projectService.findProjects(args);
  }

  @Query(() => Project, { nullable: true })
  @Roles('ORGANIZATION_ADMIN')
  async project(@Args() args: FindOneArgs): Promise<Project | null> {
    return this.projectService.findProject(args);
  }

  @Mutation(() => Project, { nullable: false })
  @Roles('ORGANIZATION_ADMIN')
  @InjectContextValue(
    InjectableResourceParameter.WorkspaceId,
    'data.workspace.connect.id'
  )
  async createProject(
    @Args() args: ProjectCreateArgs,
    @UserEntity() user: User
  ): Promise<Project> {
    return this.projectService.createProject(args, user.id);
  }
}