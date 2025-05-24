import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DocumentTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        return this.transformResponse(data);
      }),
    );
  }

  private transformResponse(data: any): any {
    if (!data) return data;

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.transformItem(item));
    }

    // Handle objects with items array (pagination)
    if (data.items && Array.isArray(data.items)) {
      return {
        ...data,
        items: data.items.map(item => this.transformItem(item))
      };
    }

    // Handle single objects
    return this.transformItem(data);
  }

  private transformItem(item: any): any {
    if (!item || typeof item !== 'object') return item;

    const transformed = { ...item };

    // Convert _id to id if it exists
    if (item._id) {
      transformed.id = this.convertIdToString(item._id);
      delete transformed._id;
    }

    // Remove MongoDB-specific fields
    delete transformed.__v;

    return transformed;
  }

  private convertIdToString(id: any): string {
    if (!id) return '';

    // Handle ObjectId
    if (typeof id.toString === 'function') {
      return id.toString();
    }

    // Handle Buffer id
    if (typeof id === 'object' && id.buffer) {
      return id.buffer.toString('hex');
    }

    return String(id);
  }
}