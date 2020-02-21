import React from 'react';

import { Box, Color, StdinContext } from 'ink';

import { ARROW_DOWN, ARROW_UP, CTRL_C, ENTER } from '../common/constants';

export interface IndicatorArgs {
  isSelected: boolean;
}

const Indicator = ({ isSelected }: IndicatorArgs): JSX.Element => {
  return (
    <Box>
      <Color blue>{isSelected ? `❯ ` : '  '}</Color>
    </Box>
  );
};

export interface ItemArgs extends IndicatorArgs {
  label: string;
}

const Item = ({ isSelected, label }: ItemArgs): JSX.Element => (
  <Color blue={isSelected}>{label}</Color>
);

interface State {
  selectedIndex: number;
}

export const SelectInput = (props: any): JSX.Element => (
  <StdinContext.Consumer>
    {({ stdin, setRawMode }): JSX.Element => (
      <InkSelectInput stdin={stdin} setRawMode={setRawMode} {...props} />
    )}
  </StdinContext.Consumer>
);

class InkSelectInput extends React.Component<any, State> {
  public state = {
    selectedIndex: 0,
  };

  public render(): JSX.Element {
    const { items } = this.props;
    const { selectedIndex } = this.state;

    const slicedItems = items;

    return (
      <Box flexDirection="column">
        {slicedItems.map((item, index) => {
          const isSelected = index === selectedIndex;

          return (
            <Box key={item.value}>
              <Indicator isSelected={isSelected} />
              <Item {...item} isSelected={isSelected} />
            </Box>
          );
        })}
      </Box>
    );
  }

  public componentDidMount(): void {
    this.props.setRawMode(true);

    this.props.stdin.on('data', (data: any) => {
      const input = String(data);

      switch (input) {
        case ARROW_UP:
          this.setState({ selectedIndex: this.state.selectedIndex - 1 });
          break;
        case ARROW_DOWN:
          this.setState({ selectedIndex: this.state.selectedIndex + 1 });
          break;
        case ENTER:
          this.props.onSelect(this.props.items[this.state.selectedIndex]);
        case CTRL_C:
          this.props.onCancel();
      }
    });
  }
}
