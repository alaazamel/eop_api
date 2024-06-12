import { AbuseType } from '../entities/abuse-type.entity';

export class AbuseTypeSerializer {
  static serialize(data?: AbuseType) {
    if (!data) return undefined;
    return {
      value: data.id,
      label: data.name,
      category: data.category,
    };
  }

  static serializeList(data?: AbuseType[]) {
    if (!data) return undefined;
    return data.map((item: AbuseType) => this.serialize(item));
  }
}
