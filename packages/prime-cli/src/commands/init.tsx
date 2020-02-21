import React from 'react';

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

import copyTemplateDir from 'copy-template-dir';
import { Box, Color, Instance, render } from 'ink';
import TextInput from 'ink-text-input';
import Static from 'ink/build/components/Static';
import { kebabCase } from 'lodash';
import meow from 'meow';

import { Spinner } from '../components/ink-spinner';

enum WizardState {
  PROJECT_NAME,
  POSTGRES_USERNAME,
  POSTGRES_PASSWORD,
  POSTGRES_DATABASE,
  INSTALL,
  ERROR,
  DONE,
}

interface Props {
  projectName?: string;
}

interface State {
  wizardState: WizardState;
  projectNameInvalid: boolean;
  projectName: string;
  postgresUsername: string;
  postgresPassword: string;
  postgresDatabase: string;
  installMessage: string;
}

export const initCommand = (cli: meow.Result): Instance => {
  // setInterval(() => null, 100); Why is this here?
  return render(<InitCommand projectName={cli.input[1]} />);
};

class InitCommand extends React.Component<Props, State> {
  public state = {
    wizardState: this.getInitialWizardState(),
    projectNameInvalid: false,
    projectName: this.props.projectName || '',
    postgresUsername: '',
    postgresPassword: '',
    postgresDatabase: '',
    installMessage: 'Installing...',
  };

  public getInitialWizardState(): WizardState {
    if (String(this.props.projectName || '').trim() === '') {
      return WizardState.PROJECT_NAME;
    }

    return WizardState.POSTGRES_USERNAME;
  }

  public componentDidMount(): void {
    const ENTER = '\r';

    process.stdin.on('data', data => {
      const { wizardState, projectName } = this.state;
      let value; // I don't agree with this but thats scoping issues for you

      if (String(data) === ENTER) {
        switch (wizardState) {
          case WizardState.PROJECT_NAME:
            const projectNameInvalid = projectName.trim() === '';
            this.setState({ projectNameInvalid });

            if (projectNameInvalid) {
              return;
            }
            break;

          case WizardState.POSTGRES_USERNAME:
            value = this.state.postgresUsername;
            if (value.trim() === '') {
              this.setState({ postgresUsername: require('os').userInfo().username });
            }
            break;

          case WizardState.POSTGRES_PASSWORD:
            value = this.state.postgresPassword;
            if (value.trim() === '') {
              this.setState({ postgresPassword: '' });
            }
            break;

          case WizardState.POSTGRES_DATABASE:
            value = this.state.postgresDatabase;
            if (value.trim() === '') {
              this.setState({ postgresDatabase: 'prime' });
            }

            this.install();
            break;
        }

        this.setState({ wizardState: this.state.wizardState + 1 });
      }
    });
  }

  public install(): void {
    const { projectName, postgresUsername, postgresPassword, postgresDatabase } = this.state;

    const templateDir = path.join(__dirname, '..', '..', 'template');

    const targetDir = path.join(process.cwd(), projectName);

    const vars = {
      projectName,
      projectNameKebabCase: kebabCase(projectName),
      connectionString: `postgresql://${postgresUsername}${
        postgresDatabase ? `:${postgresPassword}` : ''
      }@localhost:5432/${postgresPassword}`,
      randomSecret: Math.floor(Math.random() * 10000).toString(36),
    };

    if (fs.existsSync(targetDir)) {
      throw new Error('Target dir exists');
    }

    this.setState({ installMessage: 'Copying template to project directory' });

    copyTemplateDir(templateDir, targetDir, vars, err => {
      if (err) {
        throw err;
      }

      this.setState({ installMessage: 'Installing dependencies' });

      const installer = spawn('yarn', ['install'], { cwd: targetDir, detached: true });

      installer.stdout.on('data', (data: any) => {
        const installMessage = data
          .toString()
          .trim()
          .split('\n')
          .pop();

        this.setState({
          installMessage,
        });
      });

      installer.on('close', () => {
        this.setState({ wizardState: WizardState.DONE, installMessage: 'Install finished' }, () => {
          setTimeout(() => process.exit(), 1000);
        });
      });
    });
  }

  public renderStaticOrInput = (
    targetState,
    title,
    statePropertyName: string,
    passProps: any = {}
  ): JSX.Element => {
    const { wizardState } = this.state;

    if (wizardState === targetState) {
      return (
        <Box>
          <Box>{title}: </Box>
          <TextInput
            value={this.state[statePropertyName]}
            onChange={(value): void => {
              this.setState({
                projectNameInvalid: false,
                [statePropertyName]: value,
              } as any);
            }}
            {...passProps}
          />
        </Box>
      );
    }
    if (wizardState >= targetState) {
      let value = this.state[statePropertyName];
      if (!value || value === '') {
        value = (passProps && passProps.placeholder) || '';
      }
      if (passProps.mask) {
        value = passProps.mask.repeat(value.length);
      }
      return (
        <Static>
          <Box>
            {title}: <Color green>{value}</Color>
          </Box>
        </Static>
      );
    }

    return <></>;
  };

  public renderDone(): JSX.Element {
    if (this.state.wizardState === WizardState.DONE) {
      return (
        <Box flexDirection="column">
          <Box marginTop={1}>To start Prime CMS</Box>
          <Box marginTop={1} marginLeft={4} flexDirection="column">
            <Box>
              <Color green>cd {String(this.state.projectName)}</Color>
            </Box>
            <Box>
              <Color green>yarn start</Color>
            </Box>
          </Box>
          <Box marginTop={1} marginBottom={1}>
            Submit issue if you have any problems: https://github.com/birkir/prime/issues
          </Box>
        </Box>
      );
    }
    return <></>;
  }

  public render(): JSX.Element {
    if (this.state.wizardState >= WizardState.INSTALL) {
      return (
        <Box flexDirection="column">
          <Box>
            <Spinner type="dots12" yellow={this.state.wizardState === WizardState.INSTALL} />
            <Box>
              {' '}
              <Color green>{this.state.installMessage}</Color>
            </Box>
          </Box>
          {this.renderDone()}
        </Box>
      );
    }

    return (
      <Box flexDirection="column">
        <Box>
          {this.renderStaticOrInput(WizardState.PROJECT_NAME, 'Project name', 'projectName')}
          {this.state.projectNameInvalid && <Color red>invalid</Color>}
        </Box>
        {this.renderStaticOrInput(
          WizardState.POSTGRES_USERNAME,
          'Postgres username',
          'postgresUsername',
          { placeholder: require('os').userInfo().username }
        )}
        {this.renderStaticOrInput(
          WizardState.POSTGRES_PASSWORD,
          'Postgres password',
          'postgresPassword',
          { mask: '*' }
        )}
        {this.renderStaticOrInput(
          WizardState.POSTGRES_DATABASE,
          'Postgres database',
          'postgresDatabase',
          { placeholder: 'prime' }
        )}
      </Box>
    );
  }
}
