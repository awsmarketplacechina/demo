import { resourceAPI } from '../api/resources';
import { ResourceType, ResourceConfig } from '../types/deployment';

export class ResourceDiscoveryService {
  private static instance: ResourceDiscoveryService;
  
  private constructor() {}
  
  static getInstance(): ResourceDiscoveryService {
    if (!this.instance) {
      this.instance = new ResourceDiscoveryService();
    }
    return this.instance;
  }

  async discoverResources(credentials: {
    platform: 'alicloud';
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  }): Promise<Record<ResourceType, ResourceConfig[]>> {
    try {
      const response = await resourceAPI.discoverResources({
        platform: credentials.platform,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          region: credentials.region
        }
      });

      // Transform API response into our internal format
      const resources: Record<ResourceType, ResourceConfig[]> = {
        ram: [],
        network: [],
        compute: [],
        storage: []
      };

      // Map discovered resources to their types
      Object.entries(response.resources).forEach(([type, items]) => {
        resources[type as ResourceType] = items.map((item: any) => ({
          id: item.id || crypto.randomUUID(),
          name: item.name || `${type}-${crypto.randomUUID().slice(0, 8)}`,
          type: type as ResourceType,
          platform: 'alicloud',
          region: credentials.region,
          config: item,
          dependencies: item.dependencies || [],
          tags: item.tags || {}
        }));
      });

      return resources;
    } catch (error) {
      console.error('Resource discovery failed:', error);
      throw error;
    }
  }

  async validateResourceCompatibility(): Promise<boolean> {
    try {
      // Mock validation for testing
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Resource validation failed:', error);
      throw error;
    }
  }
}

export const resourceDiscoveryService = ResourceDiscoveryService.getInstance();
