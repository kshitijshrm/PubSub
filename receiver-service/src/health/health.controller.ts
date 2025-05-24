import { Controller, Get, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
    HealthCheck,
    HealthCheckService, 
    HealthCheckResult,
    HealthIndicatorResult,
    MongooseHealthIndicator
} from '@nestjs/terminus';
import { ServiceConstants } from '../common/constants/service.constants';

@Controller('health')
@Injectable()
export class HealthController {
  constructor(
      private health: HealthCheckService,
      private configService: ConfigService,
      private mongoose: MongooseHealthIndicator,
  ) { }

    @Get()
    @HealthCheck()
    async check(): Promise<HealthCheckResult> {
        return this.health.check([
            // Check required environment variables
            async () => this.checkEnvironmentVariables(),
            // Check MongoDB connection
            async () => this.mongoose.pingCheck('mongodb', {
                timeout: ServiceConstants.health_check_timeout_default
            }),
        ]);
    }

    private async checkEnvironmentVariables(): Promise<HealthIndicatorResult> {
        const requiredVars = [
            'MONGO_URI'
        ];

        const missingVars = requiredVars.filter(
            varName => !this.configService.get(varName)
        );

        const result: HealthIndicatorResult = {
            environmentVariables: {
                status: missingVars.length === 0 ? 'up' : 'down'
            }
        };

        if (missingVars.length > 0) {
            result.environmentVariables.message = `Missing required environment variables: ${missingVars.join(', ')}`;
        }

        return result;
    }
}
