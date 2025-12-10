import React from 'react';
import { motion } from 'framer-motion';
import { Shape } from '@/components/game/Shape';
import { ShapeType } from '@/lib/constants';
import { GameShape } from '@/types/game';
export const FloatingShapesBackground: React.FC = () => {
    // Helper to create dummy shapes for background
    const createBgShape = (id: string, type: ShapeType): GameShape => ({
        id,
        type,
        offsets: [{ r: 0, c: 0 }],
    });
    const backgroundShapes = [
        { type: ShapeType.Square, x: '10%', y: '20%', rotate: 15, scale: 1.2, delay: 0 },
        { type: ShapeType.Triangle, x: '85%', y: '15%', rotate: -10, scale: 1.5, delay: 1 },
        { type: ShapeType.Circle, x: '15%', y: '80%', rotate: 45, scale: 1.3, delay: 2 },
        { type: ShapeType.Star, x: '80%', y: '75%', rotate: -20, scale: 1.1, delay: 0.5 },
        { type: ShapeType.Diamond, x: '50%', y: '10%', rotate: 30, scale: 0.8, delay: 1.5 },
        { type: ShapeType.Locked, x: '90%', y: '50%', rotate: 10, scale: 0.9, delay: 2.5 },
    ];
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {backgroundShapes.map((config, index) => (
                <motion.div
                    key={`bg-shape-${index}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: 0.4,
                        scale: [config.scale, config.scale * 1.1, config.scale],
                        y: [0, -20, 0],
                        rotate: [config.rotate, config.rotate + 10, config.rotate]
                    }}
                    transition={{
                        delay: config.delay,
                        duration: 5 + index,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                    className="absolute w-24 h-24 md:w-32 md:h-32"
                    style={{ left: config.x, top: config.y }}
                >
                    <Shape
                        shape={createBgShape(`bg-shape-${index}`, config.type)}
                        className="shadow-2xl"
                    />
                </motion.div>
            ))}
        </div>
    );
};