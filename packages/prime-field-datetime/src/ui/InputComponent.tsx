import React from 'react';

import { PrimeFieldProps } from '@primecms/field';
import { DatePicker, Form } from 'antd';
import { get, isEmpty } from 'lodash';
import moment from 'moment';

interface State {
  value: any;
}

export class InputComponent extends React.PureComponent<PrimeFieldProps, State> {
  public onChange = (date: any): void => {
    const { field, form, path } = this.props;
    const isTime = get(field.options, 'time', false);
    form.setFieldsValue({
      [path]: date.format(isTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'),
    });
  };

  public render(): JSX.Element {
    const { document, field, form, path, initialValue } = this.props;
    const isTime = get(field.options, 'time', false);
    const value =
      isEmpty(initialValue) || typeof initialValue !== 'string' ? undefined : moment(initialValue);

    return (
      <Form.Item label={field.title}>
        <DatePicker
          key={(document && document.documentId) || 'datepicker'}
          defaultValue={value}
          format={isTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'}
          size="large"
          onChange={this.onChange}
          style={{ minWidth: 280 }}
          showTime={isTime}
        />
        {form.getFieldDecorator(path, { initialValue })(<input type="hidden" />)}
      </Form.Item>
    );
  }
}
