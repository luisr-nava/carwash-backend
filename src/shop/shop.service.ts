import { ConflictException, Injectable } from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Shop } from './entities/shop.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
  ) {}

  async createShop(createShopDto: CreateShopDto) {
    const { password, ...shopData } = createShopDto;

    const shopExist = await this.shopRepository.findOneBy({
      email: shopData.email,
    });
    if (shopExist) {
      let errors: string[] = [];
      errors.push(`El email ${shopData.email} ya esta registrado`);
      throw new ConflictException(errors);
    }

    const shop = this.shopRepository.create({
      ...shopData,
      password: bcrypt.hashSync(password, 10),
    });
    await this.shopRepository.save(shop);

    return { ...shop };
  }

  async update(id: string, updateShopDto: UpdateShopDto) {
    const { password, email, ...rest } = updateShopDto;
    if (email) {
      const shopWithEmail = await this.shopRepository.findOneBy({ email });

      if (shopWithEmail && shopWithEmail.id !== id) {
        let errors: string[] = [];
        errors.push(`El email ${email} ya esta registrado`);
        throw new ConflictException('El email ya esta registrado');
      }
    }
    let updatedData: UpdateShopDto = { ...rest };

    if (email) {
      updatedData.email = email;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedData.password = hashedPassword;
    }

    await this.shopRepository.update(id, updatedData);
    return { message: 'Actualización exitosa' };
  }
}
