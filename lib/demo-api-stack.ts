import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class DemoApiStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // Create an API Gateway REST API
    const api = new apigateway.RestApi(this, 'DashboardRestApi', {
      restApiName: 'Clouda Dashboard REST API',
    });

    // Create a Lambda function to handle API requests
    const apiHandler = new NodejsFunction(this, 'RestApiHandler', {
      entry: './src/api.ts',
      runtime: lambda.Runtime.NODEJS_20_X,
      bundling: {
        externalModules: ['aws-sdk'],
        minify: false,
      },
    });

    // Create an API Gateway proxy resource that integrates with the Lambda function
    api.root.addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(apiHandler),
      anyMethod: true,
    });
  }
}

