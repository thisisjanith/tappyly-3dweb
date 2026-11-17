import { Sparkles } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { InfinityRibbon } from './InfinityRibbon'
import { StudioEnv } from '../common/StudioEnv'
import { Starfield } from '../common/Starfield'
import { Effects } from '../common/Effects'
import { useAppState } from '../../lib/store'

export default function ServicesScene({ shape }: { shape: number }) {
  const { size } = useThree()
  const tier = useAppState((s) => s.tier)
  const mobile = size.width < 820
  return (
    <>
      <StudioEnv />
      <Starfield count={700} depth={[-25, 2]} size={0.9} />
      <group position={mobile ? [0, 2.1, -2] : [2.75, 0.75, 0]} scale={mobile ? 0.55 : 0.78}>
        <InfinityRibbon shape={shape} segments={tier === 'low' ? 500 : 1000} />
        <Sparkles count={tier === 'low' ? 40 : 90} scale={[7, 4, 3]} size={2.4} speed={0.35} color="#c9a8ff" opacity={0.8} />
      </group>
      <Effects bloom={0.95} threshold={0.55} aberration={0.0005} />
    </>
  )
}
