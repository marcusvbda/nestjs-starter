import { Injectable } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';

@Injectable()
export class CatsService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(createCatDto: CreateCatDto) {
    return 'This action adds a new cat';
  }

  getModuleName() {
    return 'cats';
  }

  findAll() {
    const name = this.getModuleName();
    return `This action returns all ${name}`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cat`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateCatDto: UpdateCatDto) {
    return `This action updates a #${id} cat`;
  }

  remove(id: number) {
    return `This action removes a #${id} cat`;
  }
}
