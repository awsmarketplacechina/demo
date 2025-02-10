import { useState, useEffect } from 'react'
import { Button } from "./components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group"
import { Loader2 } from "lucide-react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./components/ui/accordion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./components/ui/dialog"
import { ResourceTopology } from "./components/ResourceTopology"

interface ResourceSectionProps {
  title: string
  code: string
  isAnalyzed: boolean
  verificationPhase: 'testing' | 'preview' | 'deployment' | 'complete'
}

const ResourceSection = ({ title, code, isAnalyzed, verificationPhase }: ResourceSectionProps) => (
  <AccordionItem value={title} className={!isAnalyzed ? "opacity-50" : ""}>
    <AccordionTrigger className="text-base font-medium" disabled={!isAnalyzed}>
      {title}
      {!isAnalyzed && verificationPhase !== 'complete' && verificationPhase !== 'preview' && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
    </AccordionTrigger>
    <AccordionContent>
      <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
        {isAnalyzed ? code : "分析中..."}
      </pre>
    </AccordionContent>
  </AccordionItem>
)

function App() {
  const mockDeploymentProgress = {
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
  }

  type ResourceType = keyof typeof mockDeploymentProgress

  const [currentPage, setCurrentPage] = useState(1)
  const [verificationPassed, setVerificationPassed] = useState(false)
  const [infrastructureChecked, setInfrastructureChecked] = useState(false)
  const [resourceMappingComplete, setResourceMappingComplete] = useState(false)
  const [mockThoughts, setMockThoughts] = useState<string[]>([])
  const [verificationPhase, setVerificationPhase] = useState<'testing' | 'preview' | 'deployment' | 'complete'>('testing')
  const [verificationThoughts, setVerificationThoughts] = useState<string[]>([])
  const [selectedResources, setSelectedResources] = useState<ResourceType[]>([])
  const [deploymentInProgress, setDeploymentInProgress] = useState(false)
  const [deploymentProgress, setDeploymentProgress] = useState(mockDeploymentProgress)
  const [showCheckDialog, setShowCheckDialog] = useState(false)
  const [checkPhase, setCheckPhase] = useState<'source_permission' | 'aws_permission' | 'source_resources' | 'complete'>('source_permission')
  const [formData, setFormData] = useState({
    projectName: '',
    sourcePlatform: 'alicloud',
    sourceAccount: '',
    sourceAK: '',
    sourceSK: '',
    awsAccount: '',
    awsAK: '',
    awsSK: ''
  })

  const mockSourceResources = {
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
  }

  const mockAwsResources = {
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
  }

  const mockDevinThoughts = [
    "分析源平台资源类型和配置...",
    "将阿里云 RAM 用户映射到 AWS IAM 用户...",
    "调整网络配置以匹配 AWS VPC 要求...",
    "选择合适的 AWS 实例类型替代阿里云 ECS...",
    "将阿里云 OSS 存储桶映射到 AWS S3..."
  ]

  // Initial empty state for AWS advantages
  const [awsAdvantages, setAwsAdvantages] = useState<Record<string, string[]>>({
    ram: [],
    network: [],
    compute: [],
    storage: []
  })

  // Function to analyze and generate AWS advantages
  const generateAwsAdvantages = (resourceType: string, sourceCode: string, awsCode: string) => {
    // Simulated AI analysis based on resource comparison
    const advantages: string[] = []
    
    if (resourceType === 'ram') {
      if (awsCode.includes('force_destroy')) {
        advantages.push('支持资源完全清理，降低残留安全风险')
      }
      if (awsCode.includes('tags')) {
        advantages.push('强大的标签管理功能，便于资源分类和权限控制')
      }
      advantages.push('与其他AWS服务无缝集成，统一的身份管理')
      advantages.push('支持多因素认证（MFA）增强安全性')
    } else if (resourceType === 'network') {
      if (awsCode.includes('vpc')) {
        advantages.push('灵活的VPC配置，支持复杂网络架构')
      }
      advantages.push('全球基础设施，低延迟高可用')
      advantages.push('强大的安全组和网络ACL管理')
    } else if (resourceType === 'compute') {
      if (awsCode.includes('instance_type')) {
        advantages.push('丰富的实例类型满足不同需求')
      }
      if (sourceCode.includes('PostPaid')) {
        advantages.push('灵活的计费模式，按需付费降低成本')
      }
      advantages.push('支持自动扩展，根据负载自动调整资源')
    } else if (resourceType === 'storage') {
      if (awsCode.includes('bucket')) {
        advantages.push('全球分布式存储，数据高可用')
      }
      if (awsCode.includes('acl')) {
        advantages.push('细粒度的访问控制和权限管理')
      }
      advantages.push('多种存储类型满足不同场景需求')
    }
    
    return advantages
  }

  const mockVerificationThoughts = [
    "开始验证转换后的资源...",
    "准备测试环境...",
    "部署 IAM 用户配置...",
    "部署网络配置...",
    "部署计算资源...",
    "部署存储资源...",
    "验证资源配置正确性...",
    "清理测试资源...",
    "验证完成，资源映射正确"
  ]

  // Track which resources have been analyzed
  const [analyzedResources, setAnalyzedResources] = useState<string[]>([])

  useEffect(() => {
    if (currentPage === 2 && mockThoughts.length === 0) {
      // Only reset and start analysis if not already done
      setResourceMappingComplete(false)
      setAnalyzedResources([])
      // Mock resource mapping process
      const addThought = (index: number) => {
        if (index < mockDevinThoughts.length) {
          setMockThoughts(prev => [...prev, mockDevinThoughts[index]])
          // Add resource to analyzed list and generate advantages
          if (index === 1) {
            setAnalyzedResources(prev => [...prev, 'ram'])
            const advantages = generateAwsAdvantages('ram', mockSourceResources.ram, mockAwsResources.ram)
            setAwsAdvantages(prev => ({ ...prev, ram: advantages }))
          }
          if (index === 2) {
            setAnalyzedResources(prev => [...prev, 'network'])
            const advantages = generateAwsAdvantages('network', mockSourceResources.network, mockAwsResources.network)
            setAwsAdvantages(prev => ({ ...prev, network: advantages }))
          }
          if (index === 3) {
            setAnalyzedResources(prev => [...prev, 'compute'])
            const advantages = generateAwsAdvantages('compute', mockSourceResources.compute, mockAwsResources.compute)
            setAwsAdvantages(prev => ({ ...prev, compute: advantages }))
          }
          if (index === 4) {
            setAnalyzedResources(prev => [...prev, 'storage'])
            const advantages = generateAwsAdvantages('storage', mockSourceResources.storage, mockAwsResources.storage)
            setAwsAdvantages(prev => ({ ...prev, storage: advantages }))
            setResourceMappingComplete(true)
          }
          setTimeout(() => addThought(index + 1), 1500)
        }
      }
      setTimeout(() => addThought(0), 1000)
    }
    if (currentPage === 3) {
      setVerificationPhase('testing')
      setVerificationThoughts([])
      // Set all resources selected by default
      setSelectedResources(['ram', 'network', 'compute', 'storage'])
      // Mock verification process
      const addVerificationThought = (index: number) => {
        if (index < mockVerificationThoughts.length) {
          setVerificationThoughts(prev => [...prev, mockVerificationThoughts[index]])
          if (index === mockVerificationThoughts.length - 1) {
            setVerificationPassed(true)
          }
          setTimeout(() => addVerificationThought(index + 1), 1500)
        }
      }
      setTimeout(() => addVerificationThought(0), 1000)
    }
  }, [currentPage])

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleCheck = () => {
    setShowCheckDialog(true)
    // Start source platform permission check
    setTimeout(() => {
      setCheckPhase('aws_permission')
      // Start AWS permission check
      setTimeout(() => {
        setCheckPhase('source_resources')
        // Start source resources check
        setTimeout(() => {
          setVerificationPassed(true)
          setInfrastructureChecked(true)
          setCheckPhase('complete')
          setTimeout(() => {
            setShowCheckDialog(false)
          }, 1000)
        }, 3000)
      }, 3000)
    }, 3000)
  }

  const handleNext = () => {
    setCurrentPage(prev => {
      if (prev === 1) return 2  // From basic info to migration analysis
      if (prev === 2) return 3  // From migration analysis to resource mapping
      if (prev === 3) return 6  // From resource mapping directly to deployment
      return prev
    })
    // Reset verification state when moving to page 3
    if (currentPage === 2) {
      setVerificationPassed(false)
      setVerificationPhase('testing')
    }
    // Set deployment state when moving to page 6
    if (currentPage === 3) {
      setVerificationPhase('deployment')
      setSelectedResources(['ram', 'network', 'compute', 'storage'])
    }
  }

  const handlePrevious = () => {
    setCurrentPage(prev => {
      if (prev === 6) return 3  // From deployment back to resource mapping
      if (prev === 3) return 2  // From resource mapping back to migration analysis
      if (prev === 2) return 1  // From migration analysis back to basic info
      return prev
    })
    // Reset states when going back
    setVerificationPassed(false)
    setVerificationPhase('testing')
    if (currentPage === 6) {
      setSelectedResources([])
    }
  }

  const startDeployment = () => {
    setVerificationPhase('complete')
    setDeploymentInProgress(true)
    const resourceOrder: ResourceType[] = ['ram', 'network', 'compute', 'storage']
    let currentResourceIndex = 0
    
    const deployNextResource = () => {
      if (currentResourceIndex >= resourceOrder.length) {
        setDeploymentInProgress(false)
        return
      }

      const resourceType = resourceOrder[currentResourceIndex]
      setDeploymentProgress(prev => ({
        ...prev,
        [resourceType]: {
          ...prev[resourceType as ResourceType],
          status: 'in_progress' as const,
          currentStep: 0
        }
      }))

      let currentStep = 0
      const resource = mockDeploymentProgress[resourceType]
      
      const processStep = () => {
        if (currentStep >= resource.steps.length) {
          setDeploymentProgress(prev => ({
            ...prev,
            [resourceType]: {
              ...prev[resourceType as ResourceType],
              status: 'completed' as const
            }
          }))
          currentResourceIndex++
          setTimeout(deployNextResource, 1000)
          return
        }

        setDeploymentProgress(prev => ({
          ...prev,
          [resourceType]: {
            ...prev[resourceType as ResourceType],
            currentStep: currentStep
          }
        }))

        currentStep++
        setTimeout(processStep, 2000)
      }

      processStep()
    }

    deployNextResource()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Dialog open={showCheckDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {checkPhase === 'source_permission' ? '源平台账号权限检查' : 
               checkPhase === 'aws_permission' ? 'AWS账号权限检查' : 
               checkPhase === 'source_resources' ? '源平台资源检查' : 
               '检查完成'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            {checkPhase !== 'complete' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-full mb-4 p-4 bg-gray-50 rounded-lg">
                  {checkPhase === 'source_permission' && (
                    <div className="space-y-2">
                      <p>阿里云账号：{formData.sourceAccount}</p>
                    </div>
                  )}
                  {checkPhase === 'aws_permission' && (
                    <div className="space-y-2">
                      <p>AWS账号：{formData.awsAccount}</p>
                    </div>
                  )}
                  {checkPhase === 'source_resources' && (
                    <div className="space-y-2">
                      <p>阿里云账号：{formData.sourceAccount}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-500">
                      {checkPhase === 'source_permission' && '正在验证阿里云平台账号权限，请稍等...'}
                      {checkPhase === 'aws_permission' && '正在验证AWS平台账号权限，请稍等...'}
                      {checkPhase === 'source_resources' && '正在获取阿里云资源信息，请稍等...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {checkPhase === 'complete' && (
              <div className="text-center text-green-600">
                检查完成
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-4xl mx-auto p-8 pb-48"> {/* Added bottom padding for fixed elements */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">迁移工具</h1>
          <div className="space-x-4">
            <Button variant="ghost">帮助</Button>
            <Button variant="ghost">登出</Button>
          </div>
        </div>

        {currentPage === 1 ? (
          <Card>
            <CardHeader>
              <CardTitle>基本信息录入</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="projectName">项目名称</Label>
                  <Input
                    id="projectName"
                    placeholder="请输入项目名称"
                    value={formData.projectName}
                    onChange={handleInputChange('projectName')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>源平台</Label>
                  <RadioGroup
                    defaultValue={formData.sourcePlatform}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, sourcePlatform: value }))}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="alicloud" id="alicloud" />
                      <Label htmlFor="alicloud">阿里云</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sourceAccount">源账号</Label>
                  <Input
                    id="sourceAccount"
                    placeholder="请输入源平台账号"
                    value={formData.sourceAccount}
                    onChange={handleInputChange('sourceAccount')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sourceAK">源账号凭证AK</Label>
                  <Input
                    id="sourceAK"
                    type="password"
                    placeholder="请输入源平台Access Key"
                    value={formData.sourceAK}
                    onChange={handleInputChange('sourceAK')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sourceSK">源账号凭证SK</Label>
                  <Input
                    id="sourceSK"
                    type="password"
                    placeholder="请输入源平台Secret Key"
                    value={formData.sourceSK}
                    onChange={handleInputChange('sourceSK')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="awsAccount">AWS账号</Label>
                  <Input
                    id="awsAccount"
                    placeholder="请输入AWS账号"
                    value={formData.awsAccount}
                    onChange={handleInputChange('awsAccount')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="awsAK">AWS账号凭证AK</Label>
                  <Input
                    id="awsAK"
                    type="password"
                    placeholder="请输入AWS Access Key"
                    value={formData.awsAK}
                    onChange={handleInputChange('awsAK')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="awsSK">AWS账号凭证SK</Label>
                  <Input
                    id="awsSK"
                    type="password"
                    placeholder="请输入AWS Secret Key"
                    value={formData.awsSK}
                    onChange={handleInputChange('awsSK')}
                  />
                </div>

                <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-30">
                  <div className="container mx-auto flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={handleCheck}>
                      账号信息检查
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleNext}
                      disabled={!verificationPassed || !infrastructureChecked}
                    >
                      下一步
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : currentPage === 2 ? (
          <Card>
            <CardHeader>
              <CardTitle>迁移方案分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {/* Resource Analysis Process */}
                <div className="p-6 bg-blue-50 rounded-lg">
                  <h3 className="font-medium mb-4">迁移方案分析过程</h3>
                  <div className="space-y-3">
                    {mockThoughts.map((thought, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="mt-1.5">
                          {index === mockThoughts.length - 1 && !resourceMappingComplete ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="text-gray-600">{thought}</p>
                      </div>
                    ))}
                    {!resourceMappingComplete && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <span>分析中...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* AWS Advantages */}
                {resourceMappingComplete ? (
                  <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-4">AWS 组件优势</h3>
                    <div className="grid grid-cols-2 gap-6">
                      {Object.entries(awsAdvantages).map(([key, advantages]: [string, string[]]) => (
                        <div key={key} className="p-4 bg-white rounded-lg shadow-sm">
                          <h4 className="font-medium mb-2">
                            {key === 'ram' ? 'IAM 用户' :
                             key === 'network' ? '网络' :
                             key === 'compute' ? '计算' : '存储'}
                          </h4>
                          <ul className="space-y-2">
                            {advantages.map((advantage: string, index: number) => (
                              <li key={index} className="flex items-start space-x-2">
                                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                                <span className="text-gray-600">{advantage}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : analyzedResources.length > 0 && (
                  <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-4">AWS 组件优势分析中...</h3>
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="text-gray-600">正在分析AWS服务优势，请稍等...</span>
                    </div>
                  </div>
                )}

                <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-30">
                  <div className="container mx-auto flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={handlePrevious}>
                      上一步
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleNext}
                      disabled={!resourceMappingComplete}
                    >
                      下一步
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : currentPage === 3 ? (
          <Card>
            <CardHeader>
              <CardTitle>资源映射详情</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    {/* Left side: Source Platform Resources */}
                    <div>
                      <h3 className="font-medium text-lg mb-4">源平台资源</h3>
                      <Accordion type="single" collapsible className="w-full">
                        <ResourceSection title="RAM 用户" code={mockSourceResources.ram} isAnalyzed={analyzedResources.includes('ram')} verificationPhase={verificationPhase} />
                        <ResourceSection title="网络" code={mockSourceResources.network} isAnalyzed={analyzedResources.includes('network')} verificationPhase={verificationPhase} />
                        <ResourceSection title="计算" code={mockSourceResources.compute} isAnalyzed={analyzedResources.includes('compute')} verificationPhase={verificationPhase} />
                        <ResourceSection title="存储" code={mockSourceResources.storage} isAnalyzed={analyzedResources.includes('storage')} verificationPhase={verificationPhase} />
                      </Accordion>
                    </div>

                    {/* Right side: AWS Resources */}
                    <div>
                      <h3 className="font-medium text-lg mb-4">AWS 资源映射</h3>
                      <Accordion type="single" collapsible className="w-full">
                        <ResourceSection title="IAM 用户" code={mockAwsResources.ram} isAnalyzed={analyzedResources.includes('ram')} verificationPhase={verificationPhase} />
                        <ResourceSection title="网络" code={mockAwsResources.network} isAnalyzed={analyzedResources.includes('network')} verificationPhase={verificationPhase} />
                        <ResourceSection title="计算" code={mockAwsResources.compute} isAnalyzed={analyzedResources.includes('compute')} verificationPhase={verificationPhase} />
                        <ResourceSection title="存储" code={mockAwsResources.storage} isAnalyzed={analyzedResources.includes('storage')} verificationPhase={verificationPhase} />
                      </Accordion>
                    </div>
                  </div>

                  {/* Verification Process Section */}
                  {verificationPhase === 'testing' && (
                    <div className="w-full p-6 bg-blue-50 rounded-lg">
                      <h3 className="font-medium mb-4">验证过程</h3>
                      <div className="space-y-3">
                        {verificationThoughts.map((thought, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="mt-1.5">
                              {index === verificationThoughts.length - 1 ? (
                                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                              ) : (
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                              )}
                            </div>
                            <p className="text-gray-600">{thought}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-30">
                  <div className="container mx-auto flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={handlePrevious}>
                      上一步
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => setVerificationPhase('testing')}
                      disabled={!resourceMappingComplete}
                    >
                      验证
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleNext}
                      disabled={!verificationPassed}
                    >
                      下一步
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>验证和部署</CardTitle>
            </CardHeader>
            <CardContent>
              {verificationPhase === 'testing' && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-full p-6 bg-blue-50 rounded-lg">
                    <h3 className="font-medium mb-4">验证过程</h3>
                    <div className="space-y-3">
                      {verificationThoughts.map((thought, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="mt-1.5">
                            {index === verificationThoughts.length - 1 ? (
                              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-blue-500" />
                            )}
                          </div>
                          <p className="text-gray-600">{thought}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {verificationPhase === 'preview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-medium text-lg mb-4">源平台资源</h3>
                      <Accordion type="single" collapsible className="w-full">
                        <ResourceSection title="RAM 用户" code={mockSourceResources.ram} isAnalyzed={true} verificationPhase={verificationPhase} />
                        <ResourceSection title="网络" code={mockSourceResources.network} isAnalyzed={true} verificationPhase={verificationPhase} />
                        <ResourceSection title="计算" code={mockSourceResources.compute} isAnalyzed={true} verificationPhase={verificationPhase} />
                        <ResourceSection title="存储" code={mockSourceResources.storage} isAnalyzed={true} verificationPhase={verificationPhase} />
                      </Accordion>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-4">AWS 资源预览</h3>
                      <Accordion type="single" collapsible className="w-full">
                        <ResourceSection title="IAM 用户" code={mockAwsResources.ram} isAnalyzed={true} verificationPhase={verificationPhase} />
                        <ResourceSection title="网络" code={mockAwsResources.network} isAnalyzed={true} verificationPhase={verificationPhase} />
                        <ResourceSection title="计算" code={mockAwsResources.compute} isAnalyzed={true} verificationPhase={verificationPhase} />
                        <ResourceSection title="存储" code={mockAwsResources.storage} isAnalyzed={true} verificationPhase={verificationPhase} />
                      </Accordion>
                    </div>
                  </div>
                </div>
              )}

              {verificationPhase === 'deployment' && (
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-4">选择要部署的资源</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="ram"
                          checked={selectedResources.includes('ram')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedResources(prev => [...prev, 'ram'])
                            } else {
                              setSelectedResources(prev => prev.filter(r => r !== 'ram'))
                            }
                          }}
                        />
                        <label htmlFor="ram">IAM 用户</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="network"
                          checked={selectedResources.includes('network')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedResources(prev => [...prev, 'network'])
                            } else {
                              setSelectedResources(prev => prev.filter(r => r !== 'network'))
                            }
                          }}
                        />
                        <label htmlFor="network">网络</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="compute"
                          checked={selectedResources.includes('compute')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedResources(prev => [...prev, 'compute'])
                            } else {
                              setSelectedResources(prev => prev.filter(r => r !== 'compute'))
                            }
                          }}
                        />
                        <label htmlFor="compute">计算</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="storage"
                          checked={selectedResources.includes('storage')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedResources(prev => [...prev, 'storage'])
                            } else {
                              setSelectedResources(prev => prev.filter(r => r !== 'storage'))
                            }
                          }}
                        />
                        <label htmlFor="storage">存储</label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {verificationPhase === 'complete' && (
                <div className="space-y-6">
                  <div className="p-6 bg-blue-50 rounded-lg">
                    <h3 className="font-medium mb-4">部署进度</h3>
                    <div className="space-y-6">
                      {Object.entries(deploymentProgress).map(([key, resource]) => (
                        <div key={key} className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">
                              {key === 'ram' ? 'IAM 用户' :
                               key === 'network' ? '网络' :
                               key === 'compute' ? '计算' : '存储'}
                            </h4>
                            <span className={`px-2 py-1 rounded text-sm ${
                              resource.status === 'completed' ? 'bg-green-100 text-green-800' :
                              resource.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              resource.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {resource.status === 'completed' ? '已完成' :
                               resource.status === 'in_progress' ? '部署中' :
                               resource.status === 'failed' ? '失败' : '等待中'}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {resource.steps.map((step, index) => (
                              <div key={index} className="flex items-start space-x-3">
                                <div className="mt-1.5">
                                  {index === resource.currentStep && resource.status === 'in_progress' ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                  ) : (
                                    <div className={`h-2 w-2 rounded-full ${
                                      index < resource.currentStep || resource.status === 'completed'
                                        ? 'bg-green-500'
                                        : resource.status === 'failed' && index === resource.currentStep
                                        ? 'bg-red-500'
                                        : 'bg-gray-300'
                                    }`} />
                                  )}
                                </div>
                                <p className={`text-sm ${
                                  index < resource.currentStep || resource.status === 'completed'
                                    ? 'text-gray-900'
                                    : 'text-gray-500'
                                }`}>{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {!deploymentInProgress && Object.values(deploymentProgress).every(r => r.status === 'completed') && (
                    <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-4">已部署的AWS资源拓扑图</h3>
                      <ResourceTopology />
                    </div>
                  )}
                </div>
              )}

              <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-30">
                <div className="container mx-auto flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={handlePrevious}>
                    上一步
                  </Button>
                  {verificationPhase === 'testing' && (
                    <Button
                      type="button"
                      onClick={() => setVerificationPhase('preview')}
                      disabled={verificationThoughts.length < mockVerificationThoughts.length}
                    >
                      查看预览
                    </Button>
                  )}
                  {verificationPhase === 'preview' && (
                    <Button
                      type="button"
                      onClick={() => setVerificationPhase('deployment')}
                    >
                      开始部署
                    </Button>
                  )}
                  {verificationPhase === 'deployment' && (
                    <Button
                      type="button"
                      onClick={startDeployment}
                      disabled={selectedResources.length === 0 || deploymentInProgress}
                    >
                      确认部署
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AWS Advantages Section removed from bottom */}
      </div>
    </div>
  )
}

export default App
