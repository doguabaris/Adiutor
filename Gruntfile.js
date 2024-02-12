module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-banana-checker' );
	grunt.loadNpmTasks( 'grunt-exec' );

	grunt.initConfig( {
		eslint: {
			options: {
				cache: true,
				fix: grunt.option( 'fix' )
			},
			target: [ './src/**/*.js' ]
		},
		banana: {
			all: 'i18n/'
		}
	} );

	grunt.registerTask( 'lint', [ 'eslint', 'banana', 'exec' ] );
};
