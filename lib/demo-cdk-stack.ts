import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { CodeBuildStep, CodePipeline, CodePipelineSource } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

import { git } from './git';

export class DemoCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new CodePipeline(this, 'DemoPipeline', {
      pipelineName: 'DemoPipeline',
      synth: new CodeBuildStep('Synth', {
        input: CodePipelineSource.gitHub('lkchoi/demo-cdk', 'main', {
          authentication: SecretValue.secretsManager(git.secretArn, { jsonField: 'token' })
        }),
        additionalInputs: {
          '../packages/demo-sam': CodePipelineSource.gitHub('lkchoi/demo-sam', 'main', {
            authentication: SecretValue.secretsManager(git.secretArn, { jsonField: 'token' })
          })
        },
        commands: [
          'npm ci', // install dependencies
          'npm run build', // tsc the cdk
          'pwd',
          'ls',
          'npx cdk synth', // synth the cfn template
        ]
      }),
    });
  }
}
