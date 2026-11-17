import { Environment, Lightformer } from '@react-three/drei'

/** Studio light rig baked once into a cube map — gives every glossy surface its reflections. */
export function StudioEnv({ warm = 1 }: { warm?: number }) {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={['#05020f']} />
      <Lightformer form="rect" intensity={3.5} color="#d4c2ff" position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[12, 3, 1]} />
      <Lightformer form="rect" intensity={4} color="#7b3cff" position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[4, 10, 1]} />
      <Lightformer form="rect" intensity={2.6 * warm} color="#ff8a3d" position={[6, -1, 1]} rotation-y={-Math.PI / 2} scale={[3, 7, 1]} />
      <Lightformer form="circle" intensity={7} color="#ffffff" position={[3, 3, 7]} scale={2.2} />
      <Lightformer form="ring" intensity={2} color="#b48cff" position={[-3, -3, 6]} scale={3} />
    </Environment>
  )
}
