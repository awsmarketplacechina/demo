export const mockDeploymentProgress = {
  ram: {
    steps: [
      "准备部署 IAM 用户配置...",
      "创建 IAM 用户...",
      "配置用户权限...",
      "设置多因素认证...",
      "IAM 用户配置完成"
    ],
    currentStep: 0,
    status: "pending" as "pending" | "in_progress" | "completed" | "failed"
  },
  network: {
    steps: [
      "准备部署网络配置...",
      "创建 VPC...",
      "配置子网...",
      "设置路由表...",
      "配置安全组...",
      "网络配置完成"
    ],
    currentStep: 0,
    status: "pending" as "pending" | "in_progress" | "completed" | "failed"
  },
  compute: {
    steps: [
      "准备部署计算资源...",
      "创建 EC2 实例...",
      "配置实例类型...",
      "设置自动扩展...",
      "配置负载均衡...",
      "计算资源配置完成"
    ],
    currentStep: 0,
    status: "pending" as "pending" | "in_progress" | "completed" | "failed"
  },
  storage: {
    steps: [
      "准备部署存储资源...",
      "创建 S3 存储桶...",
      "配置存储策略...",
      "设置生命周期规则...",
      "存储资源配置完成"
    ],
    currentStep: 0,
    status: "pending" as "pending" | "in_progress" | "completed" | "failed"
  }
};

export const mockDevinThoughts = [
  "分析源平台资源类型和配置...",
  "将阿里云 RAM 用户映射到 AWS IAM 用户...",
  "调整网络配置以匹配 AWS VPC 要求...",
  "选择合适的 AWS 实例类型替代阿里云 ECS...",
  "将阿里云 OSS 存储桶映射到 AWS S3..."
];

export const mockVerificationThoughts = [
  "开始验证转换后的资源...",
  "准备测试环境...",
  "部署 IAM 用户配置...",
  "部署网络配置...",
  "部署计算资源...",
  "部署存储资源...",
  "验证资源配置正确性...",
  "清理测试资源...",
  "验证完成，资源映射正确"
];
