import { PlatformProblem } from '../entities/platform-problem.entity';

export class PlatformProblemSerializer {
  static serialize(data?: PlatformProblem) {
    if (!data) return undefined;
    return {
      value: data.id,
      label: data.content,
      category: data.category,
    };
  }

  static serializeList(data?: PlatformProblem[]) {
    if (!data) return undefined;
    return data.map((item: PlatformProblem) => this.serialize(item));
  }
}
