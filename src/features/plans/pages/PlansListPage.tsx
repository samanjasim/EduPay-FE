import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CreditCard, Plus, Search, Users, Calendar } from 'lucide-react';
import { Card, CardContent, Badge, Spinner, Button, Input, Pagination } from '@/components/ui';
import { PageHeader, EmptyState } from '@/components/common';
import { usePlans } from '../api';
import { useDebounce } from '@/hooks';
import { ROUTES } from '@/config';
import { format } from 'date-fns';
import type { PlanListParams } from '@/types';

const PAGE_SIZE = 9;

export default function PlansListPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const params: PlanListParams = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearch && { searchTerm: debouncedSearch }),
  };

  const { data, isLoading } = usePlans(params);
  const plans = data?.data ?? [];
  const pagination = data?.pagination;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const formatPrice = (price: number, billingCycle: string) => {
    return `$${price.toFixed(2)} / ${t(`plans.${billingCycle.toLowerCase()}`)}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('plans.title')}
        subtitle={t('plans.allPlans')}
        actions={
          <Link to={ROUTES.PLANS.CREATE}>
            <Button leftIcon={<Plus className="h-4 w-4" />}>{t('plans.createPlan')}</Button>
          </Link>
        }
      />

      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="sm:max-w-xs flex-1">
          <Input
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={handleSearchChange}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : plans.length === 0 ? (
        <EmptyState icon={CreditCard} title={t('common.noResults')} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Link key={plan.id} to={ROUTES.PLANS.getDetail(plan.id)}>
                <Card className="hover:shadow-soft-md transition-all duration-200 cursor-pointer h-full hover:border-primary-200 dark:hover:border-primary-500/30">
                  <CardContent className="py-5">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/20">
                        <CreditCard className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={plan.isActive ? 'success' : 'warning'} size="sm">
                          {plan.isActive ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </div>
                    </div>

                    <h3 className="font-semibold text-text-primary">{plan.name}</h3>
                    {plan.description && (
                      <p className="mt-1 text-sm text-text-muted line-clamp-2">{plan.description}</p>
                    )}

                    <p className="mt-2 text-lg font-bold text-primary-600 dark:text-primary-400">
                      {formatPrice(plan.price, plan.billingCycle)}
                    </p>

                    {/* Feature badges */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {plan.allowPartialPayments && (
                        <Badge variant="outline" size="sm">{t('plans.partialPayments')}</Badge>
                      )}
                      {plan.allowInstallments && (
                        <Badge variant="outline" size="sm">{t('plans.installments')}</Badge>
                      )}
                    </div>

                    {/* Type badges */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {plan.isDefault && (
                        <Badge variant="default" size="sm">{t('plans.default')}</Badge>
                      )}
                      {plan.isPublic && (
                        <Badge variant="outline" size="sm">{t('plans.public')}</Badge>
                      )}
                      {plan.isCustom && (
                        <Badge variant="outline" size="sm">{t('plans.custom')}</Badge>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <div className="flex items-center gap-4 text-xs text-text-muted">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          <span>{plan.maxStudents} {t('plans.maxStudents')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>{plan.subscriptionCount} {t('plans.subscriptions')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-text-muted">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(new Date(plan.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {pagination && (
            <Pagination pagination={pagination} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
