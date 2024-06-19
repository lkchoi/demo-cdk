import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DemoApiStack } from './demo-api-stack';

export class DemoService extends Stage {
  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id, props);

    const api = new DemoApiStack(this, 'DemoApiStack', {});
  }
}
