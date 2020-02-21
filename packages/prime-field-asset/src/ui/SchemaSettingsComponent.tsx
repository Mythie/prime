import React from 'react';

import { PrimeFieldProps } from '@primecms/field';
import { Button, Form, Input } from 'antd';
import { get } from 'lodash';

interface State {
  cropSizes: boolean[];
}

interface OptionsCrop {
  name?: string;
  width?: string | number;
  height?: string | number;
}

interface Options {
  crops?: OptionsCrop[];
}

type Props = PrimeFieldProps & {
  options: Options;
};

export class SchemaSettingsComponent extends React.Component<Props, State> {
  public static BEFORE_SUBMIT(options: Options): void {
    if (options.crops) {
      options.crops = options.crops.filter(n => {
        if (n.name === '' || n.width === '' || n.height === '') {
          return false;
        }

        return true;
      });
    }
  }

  public state: State = {
    cropSizes: [],
  };

  private initialCropSizes = [];

  public componentDidMount(): void {
    const opts = this.props.field.options || {};
    this.initialCropSizes = get(opts, 'crops', [
      {
        name: '',
        width: '',
        height: '',
      },
    ]);
    this.setState({ cropSizes: this.initialCropSizes.map(() => true) });
  }

  public onRemoveCropSize = (e: React.MouseEvent<HTMLElement>): void => {
    const index = Number(e.currentTarget.dataset.index);
    const cropSizes = this.state.cropSizes.slice(0);
    cropSizes[index] = false;
    this.setState({ cropSizes });
  };

  public renderCropSize = (cropSize: unknown, index: number): JSX.Element => {
    if (!cropSize) {
      return <></>;
    }

    const { getFieldDecorator } = this.props.form;

    return (
      <div
        key={`cropSize${index}`}
        style={{ flexDirection: 'row', display: 'flex', width: '100%', marginBottom: 8 }}
      >
        {getFieldDecorator(`options.crops.${index}.name`, {
          initialValue: get(this.initialCropSizes, `${index}.name`, ''),
        })(<Input type="text" placeholder="Name" style={{ flex: 1, marginRight: 8 }} />)}
        <Input.Group compact style={{ width: 'auto', marginRight: 8 }}>
          {getFieldDecorator(`options.crops.${index}.width`, {
            initialValue: get(this.initialCropSizes, `${index}.width`, ''),
          })(
            <Input
              type="number"
              placeholder="width"
              className="prime__inputnumber"
              style={{ width: 60, padding: '0 8px', textAlign: 'center' }}
            />
          )}
          <Input
            style={{
              width: 16,
              textAlign: 'center',
              padding: 0,
              borderLeft: 0,
              pointerEvents: 'none',
              backgroundColor: '#fff',
            }}
            placeholder="x"
            disabled
          />
          {getFieldDecorator(`options.crops.${index}.height`, {
            initialValue: get(this.initialCropSizes, `${index}.height`, ''),
          })(
            <Input
              type="number"
              placeholder="height"
              className="prime__inputnumber"
              style={{ width: 60, padding: '0 8px', borderLeft: 0 }}
            />
          )}
        </Input.Group>
        <Button shape="circle" icon="delete" data-index={index} onClick={this.onRemoveCropSize} />
      </div>
    );
  };

  public onAddCropSize = (): void => {
    const newCropSizes = this.state.cropSizes.slice(0);

    newCropSizes.push(true);

    this.setState({
      cropSizes: newCropSizes,
    });
  };

  public render(): JSX.Element {
    return (
      <>
        <Form.Item label="Crops" style={{ margin: 0 }} />
        {this.state.cropSizes.map(this.renderCropSize)}
        <Button onClick={this.onAddCropSize}>Add crop</Button>
      </>
    );
  }
}
