'use client';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { type ReportHistory } from '@/app/lib/storage';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/app/components/ui/chart';

const chartConfig = {
  duration: {
    label: 'Duration',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const formatDurationMs = (ms?: number) => {
  if (!ms) return '0s';
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;

  return `${seconds}s`;
};

interface DurationChartProps {
  reportHistory: ReportHistory[];
}

export function DurationChart({ reportHistory }: Readonly<DurationChartProps>) {
  const openInNewTab = (url: string) => {
    typeof window !== 'undefined' && window.open(url, '_blank', 'noopener,noreferrer');
  };

  const chartData = reportHistory.map((r) => ({
    date: new Date(r.createdAt).getTime(),
    durationMs: r.duration || 0,
    durationSeconds: parseFloat(((r.duration || 0) / 1000).toFixed(1)),
    reportUrl: `/report/${r.reportID}`,
  }));

  return (
    <ChartContainer config={chartConfig} className="w-full h-full min-h-[300px]">
      <BarChart
        accessibilityLayer
        data={chartData.reverse()}
        margin={{
          left: -20,
          right: 12,
          top: 24,
          bottom: 0,
        }}
        onClick={(e) => {
          const url = e.activePayload?.at(0)?.payload?.reportUrl;
          url && openInNewTab(url);
        }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-default-200" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tickFormatter={(value: number) => {
            return new Date(value).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });
          }}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tickMargin={10} 
          tickFormatter={(value) => `${value}s`}
        />
        <ChartTooltip
          cursor={{ fill: 'var(--nextui-default-100)', opacity: 0.4 }}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, name, item, index) => (
                <>
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                    style={{ '--color-bg': 'var(--color-duration)' } as React.CSSProperties}
                  />
                  Execution Time
                  <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                    {formatDurationMs(item.payload.durationMs as number)}
                  </div>
                  {index === 0 && (
                     <div className="mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground">
                        Date
                        <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                          {new Date(item.payload.date as number).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                        </div>
                     </div>
                  )}
                </>
              )}
            />
          }
        />
        <defs>
          <linearGradient id="fillDuration" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-duration)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-duration)" stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <Bar
          dataKey="durationSeconds"
          fill="url(#fillDuration)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
