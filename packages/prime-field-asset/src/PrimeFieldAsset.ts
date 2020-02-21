import { PrimeField, PrimeFieldContext } from '@primecms/field';
import { GraphQLString } from 'graphql';
import { get } from 'lodash';

interface OptionsCrop {
  name: string;
  width: number;
  height: number;
}

interface Options {
  crops?: OptionsCrop[];
}

export class PrimeFieldAsset extends PrimeField {
  public static type = 'asset';
  public static title = 'Asset';
  public static description = 'Images, videos and other assets';
  public static defaultOptions: Options = {
    crops: [],
  };

  public static env = ['CLOUDINARY_URL'];

  public outputType(context: PrimeFieldContext): any {
    const options = this.options;

    return {
      args: {
        crop: { type: GraphQLString },
      },
      type: GraphQLString,
      resolve(root, args, ctx, info): string | null {
        const data = get(root, info.fieldName, {});
        let image: string = get(data, 'url', '');

        const fieldCrops = get(options, 'crops', []);
        const crops = get(data, 'crops', []);
        if (args.crop) {
          const crop = crops.find((c: { name: string }) => c.name === args.crop);
          const fieldCrop = fieldCrops.find((c: { name: string }) => c.name === args.crop);
          if (crop && fieldCrop) {
            const mods = [
              ['w', Math.round(crop.width)],
              ['h', Math.round(crop.height)],
              ['x', Math.round(crop.x)],
              ['y', Math.round(crop.y)],
              ['c', 'crop'],
            ].map(([key, val]) => `${key}_${val}`);

            image = image.replace(
              '/image/upload/',
              `/image/upload/${mods.join(',')}/w_${Math.round(fieldCrop.width)},h_${Math.round(
                fieldCrop.height
              )}/`
            );
          } else {
            return null;
          }
        }

        if (!image || image === '') {
          return null;
        }

        return image;
      },
    };
  }

  public inputType(context: PrimeFieldContext): any {
    return {
      type: GraphQLString,
    };
  }
}
