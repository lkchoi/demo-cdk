import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { CodeBuildStep, CodePipeline, CodePipelineSource } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

import { git } from './git';
import { DemoService } from './demo-service';
import { resolve } from 'node:path';

export class DemoCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'DemoPipeline', {
      pipelineName: 'DemoPipeline',
      synth: new CodeBuildStep('Synth', {
        input: CodePipelineSource.gitHub('lkchoi/demo-cdk', 'main', {
          authentication: SecretValue.secretsManager(git.secretArn, { jsonField: 'token' })
        }),
        additionalInputs: {
          [resolve(__dirname, '../services/demo-sam')]: CodePipelineSource.gitHub('lkchoi/demo-sam', 'main', {
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

    // const beta = new DemoService(this, 'DemoService', {});
    // pipeline.addStage(beta);
  }
}
