import { InfinityRibbon } from './InfinityRibbon'
import { StudioEnv } from '../common/StudioEnv'
import { Effects } from '../common/Effects'
import { InfinityModel } from '../common/InfinityModel'

/** The client's 3D infinity symbol for CTA banners; the procedural ribbon stands in if the model can't load. */
export default function CtaRibbon() {
  return (
    <>
      <ambientLight intensity={0.3} color="#8a6bff" />
      <pointLight position={[2, 2.5, 4]} intensity={18} color="#d8c8ff" distance={14} />
      <StudioEnv />
      <InfinityModel
        size={4.3}
        fallback={
          <group position={[0, -0.2, 0]} rotation={[0.35, 0.1, -0.25]}>
            <InfinityRibbon shape={0} width={0.5} scale={0.95} twist={3} interactive={false} segments={500} />
          </group>
        }
      />
      <Effects bloom={0.7} threshold={0.6} aberration={0} vignette={0} />
    </>
  )
}
