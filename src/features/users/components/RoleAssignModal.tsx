import { useState } from 'react';
import { Modal, ModalFooter, Button, Spinner } from '@/components/ui';
import { useRoles, useAssignUserRole } from '@/features/roles/api';

interface RoleAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentRoles: string[];
  onSuccess?: () => void;
}

export function RoleAssignModal({
  isOpen,
  onClose,
  userId,
  currentRoles,
  onSuccess,
}: RoleAssignModalProps) {
  const { data: rolesData, isLoading } = useRoles({ enabled: isOpen });
  const { mutate: assignRole, isPending } = useAssignUserRole();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const roles = rolesData?.data ?? [];
  // Filter out roles the user already has
  const availableRoles = roles.filter(
    (role) => role.isActive && !currentRoles.includes(role.name)
  );

  const handleAssign = () => {
    if (!selectedRoleId) return;
    assignRole(
      { roleId: selectedRoleId, userId },
      {
        onSuccess: () => {
          setSelectedRoleId(null);
          onSuccess?.();
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    setSelectedRoleId(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Assign Role" size="sm">
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : availableRoles.length === 0 ? (
        <p className="py-4 text-sm text-text-secondary text-center">
          No additional roles available to assign.
        </p>
      ) : (
        <div className="space-y-1">
          {availableRoles.map((role) => (
            <label
              key={role.id}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
                selectedRoleId === role.id
                  ? 'bg-primary-50 border border-primary-200 dark:bg-primary-500/10 dark:border-primary-500/30'
                  : 'hover:bg-hover border border-transparent'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={role.id}
                checked={selectedRoleId === role.id}
                onChange={() => setSelectedRoleId(role.id)}
                className="h-4 w-4 text-primary-600 accent-primary-600"
              />
              <div>
                <p className="text-sm font-medium text-text-primary">{role.name}</p>
                {role.description && (
                  <p className="text-xs text-text-muted">{role.description}</p>
                )}
              </div>
            </label>
          ))}
        </div>
      )}

      <ModalFooter>
        <Button variant="secondary" onClick={handleClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          isLoading={isPending}
          disabled={!selectedRoleId}
        >
          Assign Role
        </Button>
      </ModalFooter>
    </Modal>
  );
}
