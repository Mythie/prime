import React from 'react';

import { PrimeFieldProps } from '@primecms/field';
import { Button, Card, Form, Icon } from 'antd';
import { get } from 'lodash';

const randomByte = (): string => {
  const seq = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16);
  return seq.substr(seq.length - 1, 1);
};

const randomBytes = (length): string =>
  Array.from({ length })
    .map(randomByte)
    .join('');

const randomUuid = (): string => [8, 4, 4, 4, 12].map(randomBytes).join('-');

const { uuid = { v4: randomUuid } } = window as any;

const initialToken: string = uuid.v4();

const getItems = ({ initialValue, field }: PrimeFieldProps): any[] => {
  const options = { ...field.defaultOptions, ...field.options };

  if (!options.repeated) {
    return [[initialToken, 0]];
  }

  if (Array.isArray(initialValue)) {
    return initialValue.map((_, index) => [uuid.v4(), index]);
  }

  return [];
};

const getIndex = (props: PrimeFieldProps): number => {
  return Math.max(-1, ...getItems(props).map(n => n[1])) + 1;
};

export class InputComponent extends React.PureComponent<PrimeFieldProps, any> {
  public state = {
    items: getItems(this.props),
    index: getIndex(this.props),
  };

  get options(): any {
    const { field } = this.props;
    return { ...field.defaultOptions, ...field.options };
  }

  public UNSAFE_componentWillReceiveProps(nextProps: PrimeFieldProps): void {
    if (!this.props.document && nextProps.document) {
      this.setState({
        items: getItems(nextProps),
        index: getIndex(nextProps),
      });
    } else if (this.props.document && nextProps.document) {
      if (this.props.document.id !== nextProps.document.id) {
        this.setState({
          items: this.state.items.map((item, index) => {
            return [item[0], index];
          }),
          index: this.state.items.length + 1,
        });
      }
    }
  }

  public onRemoveClick = (e: React.MouseEvent<HTMLElement>): void => {
    const key = String(e.currentTarget.dataset.key);
    this.remove(key);
  };

  public remove = (k: any): void => {
    const items = this.state.items.slice(0);
    items.splice(items.findIndex(n => n[0] === k), 1);
    this.setState({ items });
  };

  public add = (): void => {
    const { items, index } = this.state;
    this.setState({
      items: [...items, [uuid.v4(), index]],
      index: index + 1,
    });
  };

  public renderField = (field: any, key: string, index: number): React.ReactNode => {
    const repeated = this.options.repeated;
    const prefix = repeated ? `${index}.` : '';
    const path = `${this.props.path}.${prefix}${field.name}`;
    const initialValue = get(this.props.initialValue, `${prefix}${field.name}`);

    return this.props.renderField({
      ...this.props,
      field,
      path,
      initialValue,
    });
  };

  public renderGroupItem = ([key, index]: any): JSX.Element => {
    const { field } = this.props;
    const { fields = [] } = field;
    const repeated = this.options.repeated;

    if (!key) {
      return <></>;
    }

    return (
      <Card key={key} className="prime-group-item">
        {repeated && (
          <div className="prime-slice-item-actions">
            <Icon
              className="prime-slice-item-button"
              type="minus"
              data-key={key}
              onClick={this.onRemoveClick}
            />
          </div>
        )}
        {fields.map((f: any) => this.renderField(f, key, index))}
      </Card>
    );
  };

  public render(): JSX.Element {
    const { items } = this.state;
    const { field } = this.props;
    const repeated = this.options.repeated;

    if (field.fields.length === 0) {
      return <></>;
    }

    return (
      <Form.Item label={field.title} className="prime-group">
        {items.map(this.renderGroupItem)}
        {repeated && (
          <div style={{ textAlign: 'center' }}>
            <Button
              size="large"
              shape="circle"
              onClick={this.add}
              icon="plus"
              className="prime-slice-add"
            />
          </div>
        )}
      </Form.Item>
    );
  }
}
