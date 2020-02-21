import React from 'react';

import spinners from 'cli-spinners';
import { Box, Color } from 'ink';

interface Props {
  type?: string;
  [key: string]: any;
}

interface State {
  frame: number;
}

export class Spinner extends React.Component<Props, State> {
  public state = {
    frame: 0,
  };

  public timer: NodeJS.Timeout;

  public getSpinner(): spinners.Spinner {
    if (this.props.type) {
      return spinners[this.props.type];
    }

    return spinners.dots;
  }

  public render(): JSX.Element {
    const { ...colorProps } = this.props;
    const spinner = this.getSpinner();

    return (
      <Box>
        <Color {...colorProps}>{spinner.frames[this.state.frame]}</Color>
      </Box>
    );
  }

  public componentDidMount(): void {
    const spinner = this.getSpinner();
    this.timer = setInterval(this.switchFrame, spinner.interval);
  }

  public componentWillUnmount(): void {
    clearInterval(this.timer);
  }

  public switchFrame(): void {
    const { frame } = this.state;
    const spinner = this.getSpinner();
    const isLastFrame = frame === spinner.frames.length - 1;
    const nextFrame = isLastFrame ? 0 : frame + 1;

    this.setState({
      frame: nextFrame,
    });
  }
}
