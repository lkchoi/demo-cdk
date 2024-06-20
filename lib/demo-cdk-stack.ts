import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { CodeBuildStep, CodePipeline, CodePipelineSource } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

import { git } from './git';

export class DemoCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cdkRepo = CodePipelineSource.gitHub('lkchoi/demo-cdk', 'main', {
      authentication: SecretValue.secretsManager(git.secretArn, { jsonField: 'token' })
    });

    const apiRepo = CodePipelineSource.gitHub('lkchoi/demo-sam', 'main', {
      authentication: SecretValue.secretsManager(git.secretArn, { jsonField: 'token' })
    });

    new CodePipeline(this, 'DemoPipeline', {
      pipelineName: 'DemoPipeline',
      synth: new CodeBuildStep('Synth', {
        input: cdkRepo,
        additionalInputs: {
          'packages/demo-sam': apiRepo,
        },
        commands: [
          'npm ci', // install dependencies
          'npm run build', // tsc the cdk
          'npx cdk synth', // synth the cfn template
        ]
      }),
    });
  }
}
