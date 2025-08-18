import React from 'react';
import SlideOver from '../UI/SlideOver';
import RuleForm from './RuleForm';
import { useClypr } from '../../hooks/useClypr';
import { useToast } from '../Feedback/ToastProvider';

export default function CreateRuleSlideOver({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { createRule } = useClypr();
  const toast = useToast();

  const handleSubmit = async (ruleData: any) => {
    try {
      const id = await createRule(ruleData);
      if (id !== undefined) {
        toast.push({ message: 'Rule created', type: 'success' });
        onClose();
      } else {
        toast.push({ message: 'Failed to create rule', type: 'error' });
      }
    } catch (err) {
      console.error('Error creating rule:', err);
      toast.push({ message: 'Error creating rule', type: 'error' });
    }
  };

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="Create Rule">
      <div className="p-2">
        <RuleForm onSubmit={handleSubmit} onCancel={onClose} />
      </div>
    </SlideOver>
  );
}
