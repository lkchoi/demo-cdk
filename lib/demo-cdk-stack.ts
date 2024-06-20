import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { CodeBuildStep, CodePipeline, CodePipelineSource } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

import { git } from './git';
// import { DemoService } from './demo-service';

export class DemoCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cdkRepo = CodePipelineSource.gitHub('lkchoi/demo-cdk', 'main', {
      authentication: SecretValue.secretsManager(git.secretArn, { jsonField: 'token' })
    });

    const apiRepo = CodePipelineSource.gitHub('lkchoi/demo-sam', 'main', {
      authentication: SecretValue.secretsManager(git.secretArn, { jsonField: 'token' })
    });

    const pipeline = new CodePipeline(this, 'DemoPipeline', {
      pipelineName: 'DemoPipeline',
      synth: new CodeBuildStep('Synth', {
        input: cdkRepo,
        additionalInputs: { '../target': apiRepo },
        commands: [
          'npm ci', // install dependencies
          'npm run build', // tsc the cdk
          'npx cdk synth', // synth the cfn template
        ]
      }),
    });

    pipeline.addWave('Package', {
      post: [
        new CodeBuildStep('Package', {
          input: cdkRepo,
          additionalInputs: { '../target': apiRepo },
          commands: [
            'pwd',
            'ls',
            'pushd ../',
            'pwd',
            'ls',
          ]
        })
      ]
    })
  }
}
