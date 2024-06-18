import { Stack, StackProps } from 'aws-cdk-lib';
import { CodeBuildStep, CodePipeline, CodePipelineSource } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

export class DemoCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new CodePipeline(this, 'DemoPipeline', {
      pipelineName: 'DemoPipeline',
      synth: new CodeBuildStep('Synth', {
        input: CodePipelineSource.gitHub('lkchoi/demo-sam', 'main'),
        commands: [
          'npm ci', // install dependencies
          'npm run build', // build the api
          'npx cdk synth', // synth the cfn template
        ]
      }),
    });
  }
}
