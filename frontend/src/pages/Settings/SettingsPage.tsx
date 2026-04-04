import { motion } from 'framer-motion';
import { Settings2, User, Bell, Shield, Palette } from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, Button, Input, Badge } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/ui';

export function SettingsPage() {
  const { user } = useAuthStore();

  const sections = [
    {
      id: 'profile', icon: User, title: 'Profile Settings',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <Avatar name={user?.name || ''} size="lg" />
            <div>
              <p className="text-sm font-display font-semibold text-text-primary">{user?.name}</p>
              <p className="text-xs text-text-secondary">{user?.email}</p>
              <Badge variant="teal" size="sm" className="mt-1">{user?.role}</Badge>
            </div>
          </div>
          <Input label="Full Name" defaultValue={user?.name} />
          <Input label="Email" defaultValue={user?.email} type="email" />
          <Button size="sm">Save Changes</Button>
        </div>
      ),
    },
    {
      id: 'notifications', icon: Bell, title: 'Notification Preferences',
      content: (
        <div className="space-y-3">
          {['Email alerts for inactive clients', 'Plan expiration reminders', 'Consultation schedule updates', 'Weekly summary reports'].map((item) => (
            <label key={item} className="flex items-center justify-between p-3 bg-bg-elevated rounded-md cursor-pointer hover:bg-bg-elevated/80">
              <span className="text-sm text-text-primary">{item}</span>
              <div className="w-10 h-6 bg-brand-primary/20 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-brand-primary rounded-full absolute top-1 right-1 transition-all" />
              </div>
            </label>
          ))}
        </div>
      ),
    },
    {
      id: 'security', icon: Shield, title: 'Security',
      content: (
        <div className="space-y-4">
          <Input label="Current Password" type="password" placeholder="Enter current password" />
          <Input label="New Password" type="password" placeholder="Enter new password" />
          <Input label="Confirm Password" type="password" placeholder="Confirm new password" />
          <Button size="sm">Update Password</Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <TopBar title="Settings" subtitle="Manage your account and preferences" />
      <PageWrapper>
        <div className="space-y-6 max-w-2xl">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.div key={section.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}>
                <Card>
                  <Card.Header>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-primary/10 rounded-md text-brand-primary"><Icon className="w-4 h-4" /></div>
                      <Card.Title>{section.title}</Card.Title>
                    </div>
                  </Card.Header>
                  <Card.Body>{section.content}</Card.Body>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </PageWrapper>
    </>
  );
}
