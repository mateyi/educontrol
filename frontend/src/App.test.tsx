import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Badge } from './components/common/Badge';
import { StatCard } from './components/common/StatCard';
import { Users } from 'lucide-react';

describe('Frontend Component Tests', () => {
  it('renders Badge with correct text and style', () => {
    const { container } = render(<Badge variant="success">Aprobado</Badge>);
    expect(container.textContent).toContain('Aprobado');
  });

  it('renders StatCard with title and value', () => {
    const { container } = render(
      <StatCard
        title="Total Alumnos"
        value={1247}
        subtitle="Alumnos regulares"
        icon={Users}
        trend={{ value: '5.2%', isPositive: true, label: 'vs mes anterior' }}
      />
    );
    expect(container.textContent).toContain('Total Alumnos');
    expect(container.textContent).toContain('1247');
    expect(container.textContent).toContain('+5.2%');
  });
});
