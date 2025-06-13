// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { User } from '../../entities/user.entity';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
// // import { UpdateUserDto } from './dto/

// @Injectable()
// export class UsersService {
//   constructor(
//     @InjectRepository(User)
//     private userRepository: Repository<User>,
//   ) {}

//   async create(createUserDto: CreateUserDto): Promise<User> {
//     const user = this.userRepository.create(createUserDto);
//     return this.userRepository.save(user);
//   }

//   async findAll(): Promise<User[]> {
//     return this.userRepository.find({
//       relations: ['utility_company', 'smart_meters', 'bills'],
//     });
//   }

//   async findOne(id: number): Promise<User> {
//     const user = await this.userRepository.findOne({
//       where: { user_id: id },
//       relations: ['utility_company', 'smart_meters', 'bills'],
//     });

//     if (!user) {
//       throw new NotFoundException(`User with ID ${id} not found`);
//     }

//     return user;
//   }

//   async findByUtilityId(utilityId: number): Promise<User[]> {
//     return this.userRepository.find({
//       where: { utility_id: utilityId },
//       relations: ['utility_company', 'smart_meters', 'bills'],
//     });
//   }

//   async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
//     const user = await this.findOne(id);
//     Object.assign(user, updateUserDto);
//     return this.userRepository.save(user);
//   }

//   async remove(id: number): Promise<void> {
//     const user = await this.findOne(id);
//     await this.userRepository.remove(user);
//   }
// }

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User, UserStatus, ConnectionType } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const {
      customer_id,
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      utility_id,
      connection_type,
      connection_load,
      tariff_category,
      status,
    } = createUserDto;

    const result = await this.dataSource.query(
      `
      INSERT INTO users (
        customer_id, first_name, last_name, email, phone, address, city, state, pincode,
        utility_id, connection_type, connection_load, tariff_category, status
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14
      )
      RETURNING *;
      `,
      [
        customer_id,
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        utility_id,
        connection_type,
        connection_load,
        tariff_category,
        status ?? UserStatus.ACTIVE,
      ],
    );

    return result[0];
  }

  async findAll(): Promise<User[]> {
    const result = await this.dataSource.query(
      `
      SELECT * FROM users
      ORDER BY created_at DESC
      `
    );
    return result;
  }

  async findOne(id: number): Promise<User> {
    const result = await this.dataSource.query(
      `SELECT * FROM users WHERE user_id = $1 LIMIT 1`,
      [id],
    );

    if (result.length === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return result[0];
  }

  async findByUtilityId(utilityId: number): Promise<User[]> {
    return this.dataSource.query(
      `SELECT * FROM users WHERE utility_id = $1`,
      [utilityId],
    );
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const existing = await this.findOne(id);

    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      utility_id,
      connection_type,
      connection_load,
      tariff_category,
      status,
    } = { ...existing, ...updateUserDto }; // fallback to existing values

    const result = await this.dataSource.query(
      `
      UPDATE users
      SET first_name = $1,
          last_name = $2,
          email = $3,
          phone = $4,
          address = $5,
          city = $6,
          state = $7,
          pincode = $8,
          utility_id = $9,
          connection_type = $10,
          connection_load = $11,
          tariff_category = $12,
          status = $13,
          updated_at = NOW()
      WHERE user_id = $14
      RETURNING *;
      `,
      [
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        utility_id,
        connection_type,
        connection_load,
        tariff_category,
        status,
        id,
      ],
    );

    return result[0];
  }

  async remove(id: number): Promise<void> {
    const result = await this.dataSource.query(
      `DELETE FROM users WHERE user_id = $1`,
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
