import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

export class DemoApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    try {
      // @ts-expect-error
      console.log(import.meta.dirname);
    } catch (error) {
      console.error(error);
      try {
        // @ts-expect-error
        console.log(dirname(fileURLToPath(import.meta.url)));
      } catch (error) {
        console.error(error);
      }
    }

    // Cloudwatch log group
    const logGroup = new logs.LogGroup(this, 'CloudaDashboardLogGroup', {
      logGroupName: '/aws/lambda/CloudaDashboard',
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create an API Gateway REST API
    const api = new apigateway.RestApi(this, 'DashboardRestApi', {
      restApiName: 'Clouda Dashboard REST API',
    });

    // Create a Lambda function to handle API requests
    const apiHandler = new NodejsFunction(this, 'RestApiHandler', {
      entry: '../../services/demo-sam/src/api.ts',
      runtime: lambda.Runtime.NODEJS_20_X,
      bundling: {
        externalModules: ['aws-sdk'],
        minify: false,
      },
      logGroup: logGroup,
    });

    // Create an API Gateway proxy resource that integrates with the Lambda function
    api.root.addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(apiHandler),
      anyMethod: true,
    });
  }
}
