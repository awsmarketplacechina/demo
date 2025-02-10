import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Loader2 } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useProjects } from '../contexts/ProjectContext';
import { mockDeploymentProgress, mockDevinThoughts, mockVerificationThoughts } from '../mocks/deployment';
import { mockSourceResources, mockAwsResources } from '../mocks/resources';
import { ResourceType, VerificationPhase, CheckPhase, FormData } from '../types/deployment';

interface ResourceSectionProps {
  title: string;
  code: string;
  isAnalyzed: boolean;
  verificationPhase: VerificationPhase;
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
);

export function MigrationWizard() {
  const navigate = useNavigate();
  const { addProject } = useProjects();

  // Core state
  const [currentPage, setCurrentPage] = useState(1);
  const [verificationPassed, setVerificationPassed] = useState(false);
  const [infrastructureChecked, setInfrastructureChecked] = useState(false);
  const [resourceMappingComplete, setResourceMappingComplete] = useState(false);
  const [mockThoughts, setMockThoughts] = useState<string[]>([]);
  const [verificationPhase, setVerificationPhase] = useState<VerificationPhase>('testing');
  const [verificationThoughts, setVerificationThoughts] = useState<string[]>([]);
  const [selectedResources, setSelectedResources] = useState<ResourceType[]>([]);
  const [deploymentInProgress, setDeploymentInProgress] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(mockDeploymentProgress);
  const [showCheckDialog, setShowCheckDialog] = useState(false);
  const [checkPhase, setCheckPhase] = useState<CheckPhase>('source_permission');
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    sourcePlatform: 'alicloud',
    sourceAccount: '',
    sourceAK: '',
    sourceSK: '',
    awsAccount: '',
    awsAK: '',
    awsSK: ''
  });

  // AWS advantages state
  const [awsAdvantages, setAwsAdvantages] = useState<Record<string, string[]>>({
    ram: [],
    network: [],
    compute: [],
    storage: []
  });

  // Analyzed resources state
  const [analyzedResources, setAnalyzedResources] = useState<string[]>([]);

  // Helper functions
  const generateAwsAdvantages = (resourceType: string, sourceCode: string, awsCode: string) => {
    // Simulated AI analysis based on resource comparison
    const advantages: string[] = [];
    
    if (resourceType === 'ram') {
      if (awsCode.includes('AWS::IAM::User')) {
        advantages.push('支持资源完全清理，降低残留安全风险');
      }
      if (awsCode.includes('Tags:')) {
        advantages.push('强大的标签管理功能，便于资源分类和权限控制');
      }
      advantages.push('与其他AWS服务无缝集成，统一的身份管理');
      advantages.push('支持多因素认证（MFA）增强安全性');
    } else if (resourceType === 'network') {
      if (awsCode.includes('AWS::EC2::VPC')) {
        advantages.push('灵活的VPC配置，支持复杂网络架构');
      }
      advantages.push('全球基础设施，低延迟高可用');
      advantages.push('强大的安全组和网络ACL管理');
    } else if (resourceType === 'compute') {
      if (awsCode.includes('AWS::EC2::Instance')) {
        advantages.push('丰富的实例类型满足不同需求');
      }
      if (sourceCode.includes('PostPaid')) {
        advantages.push('灵活的计费模式，按需付费降低成本');
      }
      advantages.push('支持自动扩展，根据负载自动调整资源');
    } else if (resourceType === 'storage') {
      if (awsCode.includes('AWS::S3::Bucket')) {
        advantages.push('全球分布式存储，数据高可用');
      }
      if (awsCode.includes('AccessControl')) {
        advantages.push('细粒度的访问控制和权限管理');
      }
      advantages.push('多种存储类型满足不同场景需求');
    }
    
    return advantages;
  };

  // AWS advantages state is already declared above

  // Handlers
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleNext = () => {
    setCurrentPage(prev => {
      if (prev === 1) return 2;  // From basic info to migration analysis
      if (prev === 2) return 3;  // From migration analysis to resource mapping
      if (prev === 3) return 5;  // From resource mapping directly to deployment
      return prev;
    });
  };

  const handlePrevious = () => {
    setCurrentPage(prev => {
      if (prev === 5) return 3;  // From deployment back to resource mapping
      if (prev === 3) return 2;  // From resource mapping back to migration analysis
      if (prev === 2) return 1;  // From migration analysis back to basic info
      return prev;
    });
  };

  const handleCheck = () => {
    setShowCheckDialog(true);
    // Start source platform permission check
    setTimeout(() => {
      setCheckPhase('aws_permission');
      // Start AWS permission check
      setTimeout(() => {
        setCheckPhase('source_resources');
        // Start source resources check
        setTimeout(() => {
          setVerificationPassed(true);
          setInfrastructureChecked(true);
          setCheckPhase('complete');
          setTimeout(() => {
            setShowCheckDialog(false);
          }, 1000);
        }, 3000);
      }, 3000);
    }, 3000);
  };

  const handleVerification = () => {
    setVerificationPhase('testing');
    setVerificationThoughts([]);
    
    const addVerificationThought = (index: number) => {
      if (index < mockVerificationThoughts.length) {
        setVerificationThoughts(prev => [...prev, mockVerificationThoughts[index]]);
        if (index === mockVerificationThoughts.length - 1) {
          setVerificationPhase('preview');  // Auto transition to preview
          setTimeout(() => {
            setVerificationPhase('deployment');  // Auto transition to deployment
            setTimeout(() => {
              setVerificationPassed(true);  // Only set to true after all transitions
            }, 2000);
          }, 2000);
        }
        setTimeout(() => addVerificationThought(index + 1), 1500);
      }
    };
    setTimeout(() => addVerificationThought(0), 1000);
  };

  const startDeployment = () => {
    setVerificationPhase('complete');
    setDeploymentInProgress(true);
    const resourceOrder: ResourceType[] = ['ram', 'network', 'compute', 'storage'];
    let currentResourceIndex = 0;
    
    const deployNextResource = async () => {
      if (currentResourceIndex >= resourceOrder.length) {
        // Keep deploymentInProgress true until user clicks "完成部署"
        return;
      }

      const resourceType = resourceOrder[currentResourceIndex];
      
      // Set current resource to in_progress
      setDeploymentProgress(prev => ({
        ...prev,
        [resourceType]: {
          ...prev[resourceType as ResourceType],
          status: 'in_progress' as const,
          currentStep: 0
        }
      }));

      // Process each step with a delay
      const resource = mockDeploymentProgress[resourceType];
      for (let step = 0; step < resource.steps.length; step++) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Longer delay for more visible progress
        
        setDeploymentProgress(prev => ({
          ...prev,
          [resourceType]: {
            ...prev[resourceType as ResourceType],
            currentStep: step
          }
        }));
      }

      // Mark resource as completed
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDeploymentProgress(prev => ({
        ...prev,
        [resourceType]: {
          ...prev[resourceType as ResourceType],
          status: 'completed' as const
        }
      }));

      // Move to next resource
      currentResourceIndex++;
      await new Promise(resolve => setTimeout(resolve, 2000));
      deployNextResource();
    };

    deployNextResource();
  };

  const handleCompleteDeployment = () => {
    // Set deployment state to complete
    setDeploymentInProgress(false);
    
    const newProject = {
      id: Date.now(),
      name: formData.projectName,
      sourcePlatform: formData.sourcePlatform,
      sourceAccount: formData.sourceAccount,
      targetPlatform: 'AWS',
      targetAccount: formData.awsAccount,
      status: '配置完成' as const,
      createdAt: new Date().toISOString()
    };
    
    addProject(newProject);
    navigate('/projects');
  };

  // Effects
  useEffect(() => {
    if (currentPage === 2 && mockThoughts.length === 0) {
      setResourceMappingComplete(false);
      setAnalyzedResources([]);
      const addThought = (index: number) => {
        if (index < mockDevinThoughts.length) {
          setMockThoughts(prev => [...prev, mockDevinThoughts[index]]);
          if (index === 1) {
            setAnalyzedResources(prev => [...prev, 'ram']);
            const advantages = generateAwsAdvantages('ram', mockSourceResources.ram, mockAwsResources.ram);
            setAwsAdvantages(prev => ({ ...prev, ram: advantages }));
          }
          if (index === 2) {
            setAnalyzedResources(prev => [...prev, 'network']);
            const advantages = generateAwsAdvantages('network', mockSourceResources.network, mockAwsResources.network);
            setAwsAdvantages(prev => ({ ...prev, network: advantages }));
          }
          if (index === 3) {
            setAnalyzedResources(prev => [...prev, 'compute']);
            const advantages = generateAwsAdvantages('compute', mockSourceResources.compute, mockAwsResources.compute);
            setAwsAdvantages(prev => ({ ...prev, compute: advantages }));
          }
          if (index === 4) {
            setAnalyzedResources(prev => [...prev, 'storage']);
            const advantages = generateAwsAdvantages('storage', mockSourceResources.storage, mockAwsResources.storage);
            setAwsAdvantages(prev => ({ ...prev, storage: advantages }));
            setResourceMappingComplete(true);
          }
          setTimeout(() => addThought(index + 1), 1500);
        }
      };
      setTimeout(() => addThought(0), 1000);
    }
    if (currentPage === 3) {
      setVerificationPhase('testing');
      setVerificationThoughts([]);
      setVerificationPassed(false);  // Reset verification status
      setSelectedResources(['ram', 'network', 'compute', 'storage']);
      // Automatically start verification when entering resource mapping page
      setTimeout(() => handleVerification(), 500);
    }
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Dialog open={showCheckDialog} onOpenChange={setShowCheckDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>账号信息检查</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {checkPhase !== 'complete' && (
              <div>
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-500">
                    {checkPhase === 'source_permission' && '正在验证阿里云平台账号权限，请稍等...'}
                    {checkPhase === 'aws_permission' && '正在验证AWS平台账号权限，请稍等...'}
                    {checkPhase === 'source_resources' && '正在获取阿里云资源信息，请稍等...'}
                  </span>
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

      <div className="max-w-4xl mx-auto p-8 pb-48">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">迁移工具</h1>
          <div className="space-x-4">
            <Button variant="ghost">帮助</Button>
          </div>
        </div>

        {/* Form content based on currentPage */}
        {currentPage === 1 && (
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
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, sourcePlatform: value }))}
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
              </form>
            </CardContent>
          </Card>
        )}

        {currentPage === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>迁移方案分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
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

                {resourceMappingComplete && (
                  <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-4">AWS 组件优势</h3>
                    <div className="grid grid-cols-2 gap-6">
                      {Object.entries(awsAdvantages).map(([key, advantages]) => (
                        <div key={key} className="p-4 bg-white rounded-lg shadow-sm">
                          <h4 className="font-medium mb-2">
                            {key === 'ram' ? 'IAM 用户' :
                             key === 'network' ? '网络' :
                             key === 'compute' ? '计算' : '存储'}
                          </h4>
                          <ul className="space-y-2">
                            {advantages.map((advantage, index) => (
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
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {currentPage === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>资源映射详情</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-medium text-lg mb-4">源平台资源</h3>
                    <Accordion type="single" collapsible className="w-full">
                      <ResourceSection title="RAM 用户" code={mockSourceResources.ram} isAnalyzed={analyzedResources.includes('ram')} verificationPhase={verificationPhase} />
                      <ResourceSection title="网络" code={mockSourceResources.network} isAnalyzed={analyzedResources.includes('network')} verificationPhase={verificationPhase} />
                      <ResourceSection title="计算" code={mockSourceResources.compute} isAnalyzed={analyzedResources.includes('compute')} verificationPhase={verificationPhase} />
                      <ResourceSection title="存储" code={mockSourceResources.storage} isAnalyzed={analyzedResources.includes('storage')} verificationPhase={verificationPhase} />
                    </Accordion>
                  </div>

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
                {(verificationPhase === 'testing' || verificationPhase === 'preview' || verificationPhase === 'deployment' || verificationPhase === 'complete') && (
                  <div className="mt-6 p-6 bg-blue-50 rounded-lg">
                    <h3 className="font-medium mb-4">验证过程</h3>
                    <div className="space-y-3">
                      {verificationThoughts.map((thought, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="mt-1.5">
                            {verificationPhase === 'testing' && index === verificationThoughts.length - 1 ? (
                              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-blue-500" />
                            )}
                          </div>
                          <p className="text-gray-600">{thought}</p>
                        </div>
                      ))}
                    </div>
                    {verificationPhase !== 'testing' && (
                      <div className="mt-4 p-3 bg-green-50 rounded">
                        <p className="text-green-600">验证完成，资源映射验证通过。</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}



        {currentPage === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>部署</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {verificationPhase === 'deployment' && !deploymentInProgress && (
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
                )}
                {deploymentInProgress && (
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
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {resource.status === 'completed' ? '已完成' :
                               resource.status === 'in_progress' ? '进行中' : '等待中'}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {resource.steps.map((step, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <div className="mt-1.5">
                                  {index === resource.currentStep && resource.status === 'in_progress' ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                  ) : index <= resource.currentStep ? (
                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                  ) : (
                                    <div className="h-2 w-2 rounded-full bg-gray-300" />
                                  )}
                                </div>
                                <span className={`text-sm ${
                                  index <= resource.currentStep ? 'text-gray-900' : 'text-gray-500'
                                }`}>{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}



        {/* Fixed bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
          <div className="max-w-4xl mx-auto px-8 py-4 flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentPage === 1}
            >
              上一步
            </Button>

            {currentPage === 1 && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCheck}
                  disabled={!formData.projectName || !formData.sourceAccount || !formData.sourceAK || !formData.sourceSK || !formData.awsAccount || !formData.awsAK || !formData.awsSK}
                >
                  账号信息检查
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!verificationPassed || !infrastructureChecked}
                >
                  下一步
                </Button>
              </>
            )}

            {currentPage === 2 && (
              <Button
                onClick={handleNext}
                disabled={!resourceMappingComplete}
              >
                下一步
              </Button>
            )}

            {currentPage === 3 && (
              <Button
                onClick={handleNext}
                disabled={!verificationPassed || verificationPhase !== 'deployment'}
              >
                下一步
              </Button>
            )}

            {currentPage === 5 && (
              <>
                {!deploymentInProgress && verificationPhase === 'deployment' && (
                  <Button
                    onClick={startDeployment}
                    disabled={selectedResources.length === 0}
                  >
                    开始部署
                  </Button>
                )}
                {deploymentInProgress && Object.values(deploymentProgress).every(r => r.status === 'completed') && (
                  <Button onClick={handleCompleteDeployment}>
                    完成部署
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
