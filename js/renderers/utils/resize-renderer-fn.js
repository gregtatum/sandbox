module.exports = function resizeRendererFn( renderer, camera ) {

	return function resizeRenderer() {

		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
		renderer.setSize(
			window.innerWidth,
			window.innerHeight
		)
	}
}