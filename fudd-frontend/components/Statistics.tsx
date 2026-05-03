'use client';
import { useEffect, useState } from 'react';
import { StatChartIcon, StatModelIcon, StatUserIcon } from './Icons';

interface statsProps {
    quantity: string;
    description: string;
    icon: JSX.Element;
}

const stats: statsProps[] = [
    {
        quantity: '8',
        description: 'Financial Models',
        icon: <StatModelIcon />,
    },
    {
        quantity: '6',
        description: 'API Endpoints',
        icon: <StatChartIcon />,
    },
    {
        quantity: '100%',
        description: 'Open Source',
        icon: <StatUserIcon />,
    },
    {
        quantity: '0',
        description: 'Spreadsheet Errors',
        icon: <StatChartIcon />,
    },
];

export const Statistics = () => {
    const [counts, setCounts] = useState<string[]>(stats.map(() => '0'));

    useEffect(() => {
        const intervals: Array<ReturnType<typeof setInterval>> = [];

        stats.forEach((stat, index) => {
            const targetValue = stat.quantity;
            const numericMatch = targetValue.match(/\d+(\.\d+)?/);
            if (numericMatch) {
                const targetNum = parseFloat(numericMatch[0]);
                const suffix = targetValue.replace(/[\d.]/g, '');
                let current = 0;

                if (targetNum === 0) {
                    setCounts((prev) => {
                        const next = [...prev];
                        next[index] = `${targetNum}${suffix}`;
                        return next;
                    });
                    return;
                }

                const interval = setInterval(() => {
                    current += Math.ceil(targetNum / 30);
                    if (current >= targetNum) {
                        current = targetNum;
                        clearInterval(interval);
                    }
                    setCounts((prev) => {
                        const newCounts = [...prev];
                        newCounts[index] = `${current}${suffix}`;
                        return newCounts;
                    });
                }, 50);

                intervals.push(interval);
            } else {
                setCounts((prev) => {
                    const newCounts = [...prev];
                    newCounts[index] = targetValue;
                    return newCounts;
                });
            }
        });

        return () => {
            intervals.forEach((interval) => clearInterval(interval));
        };
    }, []);

    return (
        <section id="statistics" className="mt-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map(({ description, icon }, index) => (
                    <div key={description} className="space-y-2 text-center">
                        <div className="flex justify-center text-primary">{icon}</div>
                        <h2 className="text-3xl sm:text-4xl font-bold">{counts[index]}</h2>
                        <p className="text-md text-muted-foreground">{description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};
