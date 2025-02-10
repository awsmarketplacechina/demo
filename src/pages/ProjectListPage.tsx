import { useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useProjects } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';

export const ProjectListPage = () => {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { logout } = useAuth();

  const handleNewProject = () => {
    navigate('/new-project');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">迁移工具</h1>
          <div className="space-x-4">
            <Button variant="ghost">帮助</Button>
            <Button variant="ghost" onClick={handleLogout}>登出</Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>项目列表</CardTitle>
            <Button onClick={handleNewProject}>新建</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map(project => (
                <div key={project.id} className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-sm text-gray-500">创建时间：{project.createdAt}</p>
                      <p className="text-sm text-gray-500">源平台：{project.sourcePlatform}</p>
                      <p className="text-sm text-gray-500">源账号：{project.sourceAccount}</p>
                      <p className="text-sm text-gray-500">目标平台：{project.targetPlatform}</p>
                      <p className="text-sm text-gray-500">目标账号：{project.targetAccount}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        project.status === '配置完成' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  暂无项目，点击"新建"按钮创建新项目
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
