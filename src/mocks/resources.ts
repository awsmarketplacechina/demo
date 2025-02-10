import { DeployedResource, ResourceNode, ResourceEdge } from '../types/resources';

export const mockSourceResources = {
  ram: `resource "alicloud_ram_user" "example" {
  name = "example"
  display_name = "example"
  mobile = "86-18688888888"
  email = "hello.uuu@aaa.com"
  comments = "yoyoyo"
  force = true
}`,
  storage: `resource "alicloud_oss_bucket" "bucket-acl" {
  bucket = "bucket-170309-acl"
  acl = "private"
}`,
  network: `resource "alicloud_vpc" "vpc" {
  vpc_name = "tf_test_foo"
  cidr_block = "172.16.0.0/12"
}`,
  compute: `resource "alicloud_instance" "instance" {
  instance_name = "test_foo"
  instance_type = "ecs.n4.large"
  system_disk_category = "cloud_efficiency"
  image_id = "ubuntu_18_04_64_20G_alibase_20190624.vhd"
  instance_charge_type = "PostPaid"
  vswitch_id = alicloud_vswitch.vsw.id
}`
};

export const mockAwsResources = {
  ram: `resource "aws_iam_user" "example" {
  name = "example"
  path = "/"
  force_destroy = true
  
  tags = {
    Name = "example"
    Email = "hello.uuu@aaa.com"
  }
}`,
  storage: `resource "aws_s3_bucket" "example" {
  bucket = "bucket-170309-acl"
}

resource "aws_s3_bucket_acl" "example" {
  bucket = aws_s3_bucket.example.id
  acl    = "private"
}`,
  network: `resource "aws_vpc" "main" {
  cidr_block = "172.16.0.0/12"
  
  tags = {
    Name = "tf_test_foo"
  }
}`,
  compute: `resource "aws_instance" "example" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.large"
  
  root_block_device {
    volume_type = "gp2"
  }
  
  tags = {
    Name = "test_foo"
  }
}`
};

export const mockDeployedResources: DeployedResource[] = [
  {
    id: 'iam-1',
    name: 'IAM用户1',
    type: 'iam',
    status: '已部署',
    details: {
      permissions: ['AWSFullAccess', 'EC2FullAccess'],
      mfa: '已启用',
      groups: ['管理员组']
    },
    connections: ['network-1']
  },
  {
    id: 'network-1',
    name: 'VPC配置',
    type: 'network',
    status: '已部署',
    details: {
      cidr: '10.0.0.0/16',
      subnets: ['10.0.1.0/24', '10.0.2.0/24'],
      region: 'ap-southeast-1'
    },
    connections: ['compute-1', 'storage-1']
  },
  {
    id: 'compute-1',
    name: 'EC2实例组',
    type: 'compute',
    status: '已部署',
    details: {
      instanceType: 't2.large',
      autoScaling: '已启用',
      minInstances: 2,
      maxInstances: 6
    },
    connections: ['storage-1']
  },
  {
    id: 'storage-1',
    name: 'S3存储桶',
    type: 'storage',
    status: '已部署',
    details: {
      bucketType: '标准存储',
      versioning: '已启用',
      encryption: 'AWS-KMS'
    },
    connections: []
  }
];

// Position nodes in a logical layout
export const mockNodes: ResourceNode[] = mockDeployedResources.map((resource, index) => ({
  ...resource,
  position: {
    x: 100 + (index % 2) * 300,
    y: 100 + Math.floor(index / 2) * 200
  }
}));

// Create edges between connected nodes
export const mockEdges: ResourceEdge[] = mockDeployedResources.flatMap(resource =>
  resource.connections.map(targetId => ({
    id: `${resource.id}-${targetId}`,
    source: resource.id,
    target: targetId,
    type: 'dependency',
    animated: true,
    style: { stroke: '#2563eb' }
  }))
);

// Resource type specific layouts
export const resourceTypePositions = {
  iam: { x: 100, y: 100 },
  network: { x: 400, y: 100 },
  compute: { x: 100, y: 300 },
  storage: { x: 400, y: 300 }
};
