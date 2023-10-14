import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'text', nullable: true })
  public trelloUserId: string | null;

  @Column({ type: 'bigint' })
  public telegramId: number;

  @Column({ type: 'text' })
  public firstName: string;

  @Column({ type: 'text' })
  public username: string;

  @Column({ type: 'text', nullable: true })
  public oauthToken: string | null;

  @Column({ type: 'text', nullable: true })
  public oauthTokenSecret: string | null;

  @Column({ type: 'text', nullable: true })
  public accessToken: string | null;

  @Column({ type: 'text', nullable: true })
  public accessTokenSecret: string | null;

  @Column({ type: 'bigint', nullable: true })
  public privateChatId: number | null;

  @Column({ type: 'bigint', nullable: true })
  public publicChatId: number | null;

  @CreateDateColumn({ type: 'timestamp' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt!: Date;
}
