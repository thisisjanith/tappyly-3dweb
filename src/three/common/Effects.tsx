import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise, SMAA, ToneMapping } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { useMemo } from 'react'
import { useAppState } from '../../lib/store'

type Props = { bloom?: number; threshold?: number; radius?: number; aberration?: number; vignette?: number; toneMapping?: ToneMappingMode }

/** Cinematic post stack, scaled by device tier. */
export function Effects({ bloom = 1.1, threshold = 0.22, radius = 0.75, aberration = 0.0007, vignette = 0.55, toneMapping = ToneMappingMode.ACES_FILMIC }: Props) {
  const tier = useAppState((s) => s.tier)
  const offset = useMemo(() => new THREE.Vector2(aberration, aberration * 0.6), [aberration])
  if (tier === 'low') {
    return (
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom mipmapBlur intensity={bloom * 0.9} luminanceThreshold={threshold} luminanceSmoothing={0.3} radius={radius} />
        <Vignette darkness={vignette} offset={0.3} />
        <ToneMapping mode={toneMapping} />
      </EffectComposer>
    )
  }
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <SMAA />
      <Bloom mipmapBlur intensity={bloom} luminanceThreshold={threshold} luminanceSmoothing={0.25} radius={radius} levels={tier === 'high' ? 8 : 6} />
      <ChromaticAberration offset={offset} radialModulation modulationOffset={0.35} blendFunction={BlendFunction.NORMAL} />
      <Noise opacity={0.035} premultiply blendFunction={BlendFunction.SCREEN} />
      <Vignette darkness={vignette} offset={0.3} />
      <ToneMapping mode={toneMapping} />
    </EffectComposer>
  )
}
