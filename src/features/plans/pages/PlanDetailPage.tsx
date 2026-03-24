import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CreditCard, Pencil, Trash2, Power, Users,
  DollarSign, CheckCircle2, Calendar,
} from 'lucide-react';
import { Card, CardContent, Badge, Spinner, Button } from '@/components/ui';
import { PageHeader, InfoField, ConfirmModal } from '@/components/common';
import { usePlan, useDeletePlan, useTogglePlanStatus } from '../api';
import { ROUTES } from '@/config';
import { format } from 'date-fns';

export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: plan, isLoading } = usePlan(id!);
  const { mutate: deletePlan, isPending: isDeleting } = useDeletePlan();
  const { mutate: toggleStatus, isPending: isTogglingStatus } = useTogglePlanStatus();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!plan) {
    return <div className="text-text-secondary">Plan not found.</div>;
  }

  const handleDelete = () => {
    deletePlan(id!, {
      onSuccess: () => navigate(ROUTES.PLANS.LIST),
    });
  };

  const handleToggleStatus = () => {
    toggleStatus(id!);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        backTo={ROUTES.PLANS.LIST}
        backLabel="Back to Plans"
      />

      {/* Plan Header Card */}
      <Card>
        <CardContent className="space-y-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/20">
              <CreditCard className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-text-primary">{plan.name}</h1>
              {plan.description && (
                <p className="mt-1 text-text-secondary">{plan.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={plan.isActive ? 'success' : 'warning'}>
                {plan.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Link to={ROUTES.PLANS.getEdit(id!)}>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Pencil className="h-4 w-4" />}
                >
                  Edit
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Power className="h-4 w-4" />}
                onClick={handleToggleStatus}
                isLoading={isTogglingStatus}
              >
                {plan.isActive ? 'Deactivate' : 'Activate'}
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </Button>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoField label="Price">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-text-muted" />
                <span>{plan.price}</span>
              </div>
            </InfoField>
            <InfoField label="Billing Cycle">
              <Badge variant="primary" size="sm">{plan.billingCycle}</Badge>
            </InfoField>
            <InfoField label="Max Students">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-text-muted" />
                <span>{plan.maxStudents ?? 'Unlimited'}</span>
              </div>
            </InfoField>
            <InfoField label="Subscriptions">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-text-muted" />
                <span>{plan.subscriptionCount ?? 0}</span>
              </div>
            </InfoField>
            <InfoField label="Allow Partial Payments">
              <Badge variant={plan.allowPartialPayments ? 'success' : 'default'} size="sm">
                {plan.allowPartialPayments ? 'Yes' : 'No'}
              </Badge>
            </InfoField>
            <InfoField label="Allow Installments">
              <Badge variant={plan.allowInstallments ? 'success' : 'default'} size="sm">
                {plan.allowInstallments ? 'Yes' : 'No'}
              </Badge>
            </InfoField>
            <InfoField label="Max Installments">
              {plan.maxInstallments ?? '—'}
            </InfoField>
            <InfoField label="Late Fee Percentage">
              {plan.lateFeePercentage != null ? `${plan.lateFeePercentage}%` : '—'}
            </InfoField>
            <InfoField label="Default Plan">
              <Badge variant={plan.isDefault ? 'success' : 'default'} size="sm">
                <CheckCircle2 className="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                {plan.isDefault ? 'Yes' : 'No'}
              </Badge>
            </InfoField>
            <InfoField label="Public">
              <Badge variant={plan.isPublic ? 'success' : 'default'} size="sm">
                {plan.isPublic ? 'Yes' : 'No'}
              </Badge>
            </InfoField>
            <InfoField label="Custom">
              <Badge variant={plan.isCustom ? 'warning' : 'default'} size="sm">
                {plan.isCustom ? 'Yes' : 'No'}
              </Badge>
            </InfoField>
            <InfoField label="Sort Order">
              {plan.sortOrder ?? '—'}
            </InfoField>
            <InfoField label="Created">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-text-muted" />
                <span>
                  {plan.createdAt
                    ? format(new Date(plan.createdAt), 'MMMM d, yyyy')
                    : '—'}
                </span>
              </div>
            </InfoField>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Plan"
        description={`Are you sure you want to delete the plan "${plan.name}"? This action cannot be undone.`}
        confirmLabel="Delete Plan"
        isLoading={isDeleting}
      />
    </div>
  );
}
