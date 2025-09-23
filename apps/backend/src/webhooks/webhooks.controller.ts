import { Controller, Post, Body, Headers, BadRequestException, Logger } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { Webhook } from 'svix';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('clerk')
  async handleClerkWebhook(@Body() payload: any, @Headers() headers: any) {
    try {
      this.logger.log(`Received Clerk webhook: ${payload.type}`);

      // Verify webhook signature
      const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

      if (webhookSecret) {
        try {
          const wh = new Webhook(webhookSecret);
          // For proper verification, we need the raw body and headers
          const evt = wh.verify(JSON.stringify(payload), headers);
          this.logger.log('Webhook signature verified successfully');
        } catch (err) {
          this.logger.error('Webhook signature verification failed:', err);
          throw new BadRequestException('Invalid webhook signature');
        }
      } else {
        this.logger.warn('CLERK_WEBHOOK_SECRET not set - skipping signature verification');
      }

      const eventType = payload.type;
      const eventData = payload.data;

      switch (eventType) {
        case 'organization.created':
          await this.webhooksService.handleOrganizationCreated(eventData);
          break;

        case 'organization.updated':
          await this.webhooksService.handleOrganizationUpdated(eventData);
          break;

        case 'organization.deleted':
          await this.webhooksService.handleOrganizationDeleted(eventData);
          break;

        default:
          this.logger.log(`Unhandled webhook event type: ${eventType}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Error processing Clerk webhook:', error);
      throw new BadRequestException('Failed to process webhook');
    }
  }
}