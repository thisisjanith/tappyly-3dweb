import { useThree } from '@react-three/fiber'
import { StudioEnv } from '../common/StudioEnv'
import { Starfield } from '../common/Starfield'
import { Effects } from '../common/Effects'
import { InfinityModel } from '../common/InfinityModel'
import { Particles } from './ParticleMorph'

export default function InsightsScene() {
  const { size } = useThree()
  const mobile = size.width < 820
  return (
    <>
      <ambientLight intensity={0.3} color="#8a6bff" />
      <pointLight position={[5, 3, 5]} intensity={30} color="#d8c8ff" distance={20} />
      <pointLight position={[0, -2, 3]} intensity={14} color="#7b3cff" distance={14} />
      <StudioEnv />
      <Starfield count={600} depth={[-25, 0]} />
      <group position={mobile ? [0, 1.7, -2] : [2.6, 0.3, 0]} scale={mobile ? 0.65 : 0.95}>
        {/* the particle galaxy this hero used before stands in if the model can't load */}
        <InfinityModel size={4.6} fallback={<Particles shape={0} />} />
      </group>
      <Effects bloom={0.8} threshold={0.55} aberration={0.0006} />
    </>
  )
}
