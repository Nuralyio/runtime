import { handleError } from '../../exceptions/handle.error';
import { IUserRepository, KeycloakUserInfo } from '../domain/interfaces/user.interface';
import { User } from '../domain/user';
import { Logger } from 'tslog';
import { NotFoundException } from "../../exceptions/NotFoundException";
import { PendingInviteRepository } from '../../pending-invite/repositories/pending-invite.repository';
import { ApplicationMemberRepository } from '../../application-member/repositories/application-member.repository';
import { ApplicationMember } from '../../application-member/models/application-member';

const logger = new Logger();

export class UserService {
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    public async create(keycloakId: string, name: string, email: string): Promise<User> {
        try {
            const user: User = new User(keycloakId, name, email);
            return await this.userRepository.create(user);
        } catch (error) {
            handleError(error, logger);
            throw error;
        }
    }

    public async findAll(): Promise<User[]> {
        try {
            const users = await this.userRepository.findAll();
            if (!users) {
                throw new NotFoundException('Users not found');
            }
            return users;
        } catch (error) {
            handleError(error, logger);
            throw error;
        }
    }

    public async findById(id: string): Promise<User> {
        try {
            const user = await this.userRepository.findById(id);
            if (!user) {
                throw new NotFoundException(`User with id ${id} not found.`);
            }
            return user;
        } catch (error) {
            handleError(error, logger);
            throw error;
        }
    }

    public async findByKeycloakId(keycloakId: string): Promise<User> {
        try {
            const user = await this.userRepository.findByKeycloakId(keycloakId);
            if (!user) {
                throw new NotFoundException(`User with keycloakId ${keycloakId} not found.`);
            }
            return user;
        } catch (error) {
            handleError(error, logger);
            throw error;
        }
    }

    public async findUserByEmail(email: string): Promise<User> {
        try {
            const user = await this.userRepository.findUserByEmail(email);
            if (!user) {
                throw new NotFoundException(`User with email ${email} not found.`);
            }
            return user;
        } catch (error) {
            handleError(error, logger);
            throw error;
        }
    }

    /**
     * JIT (Just-In-Time) provisioning: Find or create user from Keycloak info.
     * Also checks for pending invites and auto-accepts them.
     */
    public async findOrCreateFromKeycloak(keycloakUser: KeycloakUserInfo): Promise<User> {
        try {
            const user = await this.userRepository.findOrCreateFromKeycloak(keycloakUser);

            // Check if this is potentially a new user and process pending invites
            if (user.id && keycloakUser.email) {
                await this.acceptPendingInvites(user.id, keycloakUser.email);
            }

            return user;
        } catch (error) {
            handleError(error, logger);
            throw error;
        }
    }

    /**
     * Accept all pending invites for a user by email.
     * Called during JIT provisioning when a user signs in.
     */
    private async acceptPendingInvites(userId: string, email: string): Promise<void> {
        try {
            const pendingInviteRepo = new PendingInviteRepository();
            const memberRepo = new ApplicationMemberRepository();

            const pendingInvites = await pendingInviteRepo.findByEmail(email);

            for (const invite of pendingInvites) {
                if (invite.isExpired()) {
                    // Clean up expired invite
                    await pendingInviteRepo.delete(invite.id!);
                    continue;
                }

                try {
                    // Check if user is already a member
                    const existingMember = await memberRepo.findByUserAndApplication(
                        userId,
                        invite.applicationId
                    );

                    if (!existingMember) {
                        // Create the membership
                        const member = new ApplicationMember(
                            userId,
                            invite.applicationId,
                            invite.roleId
                        );
                        await memberRepo.create(member);
                        logger.info(`Auto-accepted invite for ${email} to application ${invite.applicationId}`);
                    }

                    // Delete the pending invite
                    await pendingInviteRepo.delete(invite.id!);
                } catch (error) {
                    // Log but don't fail the whole operation
                    logger.error(`Failed to accept invite ${invite.id} for ${email}:`, error);
                    // Still delete the invite to prevent repeated failures
                    await pendingInviteRepo.delete(invite.id!);
                }
            }
        } catch (error) {
            // Log but don't fail user creation
            logger.error(`Failed to process pending invites for ${email}:`, error);
        }
    }

    public async update(id: string, name: string, email: string): Promise<User> {
        try {
            const findUser = await this.findById(id);
            const user = new User(findUser.keycloakId, name, email, id);
            return await this.userRepository.update(id, user);
        } catch (error) {
            handleError(error, logger);
            throw error;
        }
    }

    public async delete(id: string): Promise<string> {
        try {
            await this.findById(id);
            return await this.userRepository.delete(id);
        } catch (error) {
            handleError(error, logger);
            throw error;
        }
    }
}
